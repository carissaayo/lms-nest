import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import type { Request, Response } from 'express';
import { Model } from 'mongoose';
import { TokenExpiredError } from 'jsonwebtoken';

import { TokenManager } from './token-manager.service';
import config from 'src/common/config/config';
import { User } from 'src/models/user.schema';
import { UserAdmin } from 'src/models/admin.schema';


const appConfig = config();

@Injectable()
export class AuthHandler {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenManager: TokenManager,
    @InjectModel('UserAdmin') private readonly userAdminModel: Model<UserAdmin>,
    @InjectModel('User') private readonly userModel: Model<User>,
    
  ) {}

  async authenticateToken(
    req: Request,
    res: Response,
  ): Promise<{
    success: boolean;
    user?: UserAdmin | User ;
  }> {
    const authHeader = req.headers.authorization;
    const refreshToken = req.headers['refreshtoken'] as string | undefined; 

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);


      try {
        const decoded: any = this.jwtService.verify(token, {
          secret: appConfig.jwt.access_token_secret,
        });
        if(!decoded){
            res.status(HttpStatus.UNAUTHORIZED).json({
              success: false,
              message: 'No Token',
              timestamp: new Date().toISOString(),
            });
        }

        // Find user from either collection
        const foundUser = await this.findUserById(decoded.sub);

        if (!foundUser || !foundUser.isActive) {
          res.status(HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid or inactive user',
            timestamp: new Date().toISOString(),
          });
          return { success: false };
        }

        return {
          success: true,
          user: foundUser.toObject() as UserAdmin | User,
        };
      } catch (err) {
        console.log('❌ AUTH: Access token verification failed:', err.message);

        if (err instanceof TokenExpiredError && refreshToken) {
          const refreshResult = await this.tokenManager.handleTokenRefresh(
            req,
            res,
            token,
            refreshToken,
          );

          if (refreshResult.success) {
            console.log(
              '✅ AUTH: Token refreshed successfully, allowing request',
            );
            return {
              success: true,
              user: refreshResult.user,
            };
          }

          console.log('❌ AUTH: Token refresh failed');
          return { success: false };
        }

        console.log('❌ AUTH: Non-recoverable JWT error');
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token',
          timestamp: new Date().toISOString(),
        });
        return { success: false };
      }
    }

    console.log('❌ AUTH: No Bearer token provided');
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required',
      timestamp: new Date().toISOString(),
    });
    return { success: false };
  }

  /**
   * Tries to find user from either User or UserAdmin collection
   */
  private async findUserById(
    userId: string,
  ): Promise<User | UserAdmin  | null> {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (user) return user;

      const admin = await this.userAdminModel.findById(userId).exec();
      if (admin) return admin;
      

      return null;
    } catch (error) {
      console.error('❌ AUTH: Error finding user:', error);
      return null;
    }
  }
}
