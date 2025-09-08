import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/app/models/user.schema';
import { verifyRefreshToken } from 'src/utils/jwt-utils';
import config from 'src/app/config/config';

const appConfig = config();

@Injectable()
export class AuthenticateTokenUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>() as any;

    const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log('headers====', req.headers);

    console.log('token====', token);

    if (!token || token === 'null') {
      throw new UnauthorizedException(
        'Access denied. Please include an access token',
      );
    }

    try {
      const verifiedToken = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as any;

      req.userId = verifiedToken.id;
      req.token = token;
      req.user = {
        id: verifiedToken.id,
        role: verifiedToken.role,
      };
      return true;
    } catch (err: any) {
      if (err.message === 'jwt expired') {
        console.log('jwt expired');

        const decoded = jwt.decode(token) as { id: string } | null;
        req.userId = decoded?.id;
        req.token = token;
        throw new UnauthorizedException('Token expired');
      }
      console.log('jwt denied');

      throw new UnauthorizedException(
        'Access denied. Please re-authorize token',
      );
    }
  }
}

@Injectable()
export class ReIssueTokenUserGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>() as any;

    const JWT_REFRESH_TOKEN_SECRET = appConfig.jwt.refresh_token;
    const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;

    if (!req.headers.refreshtoken) {
      throw new UnauthorizedException(
        'Access denied. Please include a refresh token',
      );
    }

    // 🔹 Find user by request userId
    const user = await this.userModel.findById(req.userId);
    if (!user) {
      throw new UnauthorizedException('Authorization failed');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact the administrator',
      );
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    const userAgent = req.headers['user-agent'];

    const activeSessions =
      user.sessions
        ?.filter(
          (obj: any) => obj.active === true && obj.userAgent === userAgent,
        )
        .map((obj: any) => obj.refreshtoken) || [];

    // 🔹 Verify refresh token
    const validSession = await verifyRefreshToken(
      req.headers.refreshtoken as string,
      activeSessions,
      JWT_ACCESS_TOKEN_SECRET,
      JWT_REFRESH_TOKEN_SECRET,
    );

    if (validSession.status === 'failed') {
      throw new UnauthorizedException(validSession.message);
    }

    if (validSession.status === 'success') {
      req.token = validSession.newToken;
    }

    return true;
  }
}
