/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import type { Request, Response } from 'express';
import { Model } from 'mongoose';
import ms from 'ms';




import config from 'src/common/config/config';
// import { RedisRateLimiter } from './radis-rate-limiter.service';
import { SecurityLogger } from './security.logger.service';
import { User } from 'src/models/user.schema';
import { AuthResult } from '../interfaces/security.interface';

import { AuthenticatedRequest } from '../interfaces/custom-request.interface';
import { UserAdmin } from 'src/models/admin.schema';
import { RefreshToken } from 'src/models/refreshToken.schema';
import { UserRole } from 'src/app/user/user.interface';

const appConfig = config();

@Injectable()
export class TokenManager {
  private readonly logger = new Logger(TokenManager.name);

  constructor(
    private readonly jwtService: JwtService,
    // private readonly redisRateLimiter: RedisRateLimiter,
    private readonly securityLogger: SecurityLogger,
    @InjectModel('UserAdmin') private readonly userAdminModel: Model<UserAdmin>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('RefreshToken')
    private readonly refreshTokenModel: Model<RefreshToken>,
  ) {}

  async handleTokenRefresh(
    req: Request,
    res: Response,
    expiredAccessToken: string,
    refreshToken: string,
  ): Promise<AuthResult> {
    try {
      // 1. Apply rate limiting specifically for refresh attempts
      const clientIP = this.getClientIP(req);
      // const refreshRateLimit = await this.redisRateLimiter.checkRateLimit(
      //   `refresh:${clientIP}`,
      //   {
      //     windowMs: 15 * 60 * 1000, // 15 minutes
      //     maxRequests: 5, // Max 5 refresh attempts per IP per 15 min
      //     blockDurationMs: 60 * 60 * 1000, // 1 hour block
      //   },
      // );

      // if (refreshRateLimit.isBlocked) {
      //   res.status(HttpStatus.TOO_MANY_REQUESTS).json({
      //     success: false,
      //     message: 'Too many refresh attempts. Try again later.',
      //     timestamp: new Date().toISOString(),
      //   });
      //   return { success: false };
      // }

      // 2. Verify refresh token with different secret
      const decodedRefresh: any = this.jwtService.verify(refreshToken, {
        secret: appConfig.jwt.refresh_token_secret,
      });

      // 3. Extract user ID from expired access token for binding verification
      let expiredUserId: string;
      try {
        const expiredDecoded = this.jwtService.decode(
          expiredAccessToken,
        ) as any;
        expiredUserId = expiredDecoded?.sub;
      } catch {
        this.logger.error('Cannot decode expired access token');
        throw new Error('Cannot decode expired access token');
      }

      // 4. Verify token binding (refresh token must belong to same user)
      if (decodedRefresh.sub !== expiredUserId) {
        await this.securityLogger.logSecurityEvent(
          req,
          res,
          true,
          'Token binding mismatch',
        );
        this.logger.error('Token binding verification failed');
        throw new Error('Token binding verification failed');
      }

      // 5. Check refresh token in database (persistence layer)
      const storedRefreshToken = await this.refreshTokenModel
        .findOne({
          tokenHash: this.hashToken(refreshToken),
          userId: decodedRefresh.sub,
          isRevoked: false,
          expiresAt: { $gt: new Date() },
        })
        .exec();

      if (!storedRefreshToken) {
        await this.securityLogger.logSecurityEvent(
          req,
          res,
          true,
          'Invalid refresh token',
        );
        this.logger.error('Refresh token not found or expired');
        throw new Error('Refresh token not found or expired');
      }

      // 6. Validate user account
      const user = await this.findUserById(decodedRefresh.sub,decodedRefresh.role);

      if (!user || !user.isActive) {
        this.logger.error('Invalid or inactive user account');
        throw new Error('Invalid or inactive user account');
      }

      const tokenHash = this.hashToken(refreshToken);
      // 🔹 6b. Track session and revoke last refresh token if necessary
      await this.trackSession(req, user, tokenHash);

      // 7. Generate new access token
      const newAccessToken = this.jwtService.sign(
        {
          sub: user._id,
          email: user.email,
          role: user.role || 'admin',
          isActive: user.isActive,
          iat: Math.floor(Date.now() / 1000),
        },
        {
          expiresIn: appConfig.jwt.duration10m,
          secret: appConfig.jwt.access_token_secret,
        },
      );

      // 8. Optionally rotate refresh token for enhanced security
      const shouldRotateRefresh = this.shouldRotateRefreshToken(
        storedRefreshToken.createdAt,
      );
      let newRefreshToken: string | undefined;

      if (shouldRotateRefresh) {
        newRefreshToken = this.jwtService.sign(
          {
            sub: user._id,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000),
          },
          {
            expiresIn: appConfig.jwt.duration1Yr,
            secret: appConfig.jwt.refresh_token_secret,
          },
        );
        console.log('req', req);

        // Revoke old refresh token and store new one
        await Promise.all([
          this.refreshTokenModel.updateOne(
            { _id: storedRefreshToken._id },
            {
              isRevoked: true,
              revokedAt: new Date(),
              revokedReason: 'Token rotation',
            },
          ),
          this.storeRefreshToken(String(user._id), newRefreshToken, req),
        ]);
      }

      // 9. Update last used timestamp
      await this.refreshTokenModel.updateOne(
        { _id: storedRefreshToken._id },
        { lastUsedAt: new Date() },
      );

      // 10. Set response headers
      res.setHeader('x-access-token', newAccessToken);
      if (newRefreshToken) {
        res.setHeader('x-refresh-token', newRefreshToken);
      }

      // Log successful refresh
      await this.securityLogger.logSecurityEvent(
        req,
        res,
        false,
        'Token refresh successful',
      );

      return {
        success: true,
        user: user.toObject() as unknown as UserAdmin,
      };
    } catch (refreshErr: any) {
      this.logger.error('Token refresh failed', {
        error: refreshErr.message,
        ip: this.getClientIP(req),
      });

      await this.securityLogger.logSecurityEvent(
        req,
        res,
        true,
        `Token refresh failed: ${refreshErr.message}`,
      );

      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Token refresh failed',
        timestamp: new Date().toISOString(),
      });
      return { success: false };
    }
  }

  // Helper methods for token management
  private hashToken(token: string): string {
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }

  private shouldRotateRefreshToken(createdAt: Date): boolean {
    const rotationInterval = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - createdAt.getTime() > rotationInterval;
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    req?: Request,
    expiresIn = '1d',
  ): Promise<void> {
    const hashedToken = this.hashToken(refreshToken);
    const expiresMs = ms(expiresIn);

    if (!expiresMs) {
      throw new Error(`Invalid expiresIn format: ${expiresIn}`);
    }
    const expiresAt = new Date(Date.now() + expiresMs);

    const ipAddress = req ? this.getClientIP(req) : '';
    const userAgent = req?.headers['user-agent'] || '';

    const existingToken = await this.refreshTokenModel.findOne({
      userId,
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    if (existingToken) {
      existingToken.lastUsedAt = new Date();
      existingToken.expiresAt = expiresAt;
      existingToken.tokenHash = hashedToken;
      await existingToken.save();
    } else {
      await this.refreshTokenModel.create({
        tokenHash: hashedToken,
        userId,
        expiresAt,
        createdAt: new Date(),
        lastUsedAt: new Date(),
        isRevoked: false,
        userAgent,
        ipAddress,
      });
    }
  }
  private getClientIP(req: Request): string {
    const xfwd = (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    const xreal = (req.headers['x-real-ip'] as string | undefined)?.trim();
    const conn = (req as any).connection?.remoteAddress as string | undefined;
    const sock = (req.socket as any)?.remoteAddress as string | undefined;
    return xfwd || xreal || conn || sock || '127.0.0.1';
  }

  public async signTokens(
    user: UserAdmin | User,
    req: Request | AuthenticatedRequest,
    options?: { shortRefresh?: boolean },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload = {
      sub: user._id,
      phoneNumber: (user as any).phoneNumber ?? user.email,
      role: user.role,
      isActive: user.isActive,
      iat: Math.floor(Date.now() / 1000),
    };

    const refreshPayload = {
      sub: user._id,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };
    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: appConfig.jwt.duration10m,
      secret: appConfig.jwt.access_token_secret,
    });
    const refreshExpiresIn = options?.shortRefresh ? '1h' : '365d';
    console.log(refreshExpiresIn);

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: refreshExpiresIn,
      secret: appConfig.jwt.refresh_token_secret,
    });

    await this.storeRefreshToken(
      String(user._id),
      refreshToken,
      req,
      refreshExpiresIn,
    );

    return { accessToken, refreshToken };
  }

  private async trackSession(
    req: Request,
    user: User | UserAdmin,
    tokenHash: string,
  ): Promise<void> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    const existingToken = await this.refreshTokenModel.findOne({
      userId: user._id,
      ipAddress,
      userAgent,
      isRevoked: false,
    });

    if (existingToken) {
      existingToken.lastUsedAt = new Date();
      await existingToken.save();
    } else {
      await this.refreshTokenModel.updateMany(
        {
          userId: user._id,
          isRevoked: false,
        },
        {
          $set: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'New login from another device or IP',
          },
        },
      );

      await this.refreshTokenModel.create({
        tokenHash,
        userId: user._id,
        ipAddress,
        userAgent,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }


  private async findUserById(
    userId: string,
    role: UserRole,
  ): Promise<(UserAdmin | User ) | null> {
    let user: User | UserAdmin | null = null;
    if (role === UserRole.INSTRUCTOR || role === UserRole.STUDENT) {
      user = await this.userModel.findById(userId).exec();
    }

    if (role === UserRole.ADMIN) {
      user = await this.userAdminModel.findById(userId).exec();
    }

    return user;
  }
}
