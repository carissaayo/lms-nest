import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/app/user/user.entity';
import { verifyRefreshToken } from 'src/utils/jwt-utils';
import config from 'src/app/config/config';
const appConfig = config();
@Injectable()
export class AuthenticateTokenUserGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>() as any;

    const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'null') {
      throw new UnauthorizedException(
        'Access denied. Please include an access token',
      );
    }

    try {
      const verifiedToken = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as any;
      req.userId = verifiedToken.id;
      req.token = token;
      return true;
    } catch (err) {
      if (err.message === 'jwt expired') {
        const decoded = jwt.decode(token) as { id: string } | null;
        req.userId = decoded?.id;
        req.token = token;
        throw new UnauthorizedException('Token expired');
      }
      console.log('err===', err);

      throw new UnauthorizedException(
        'Access denied. Please re-authorize token',
      );
    }
  }
}

@Injectable()
export class ReIssueTokenUserGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

    const user = await this.userRepo.findOne({
      where: { id: req.userId },
    });

    if (!user) {
      throw new UnauthorizedException('Authorization failed');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been suspended. Please contact the administrator',
      );
    }

    user.lastSeen = new Date();
    await this.userRepo.save(user);

    const userAgent = req.headers['user-agent'];
    const activeSessions =
      user.sessions
        ?.filter(
          (obj: any) => obj.active === true && obj.userAgent === userAgent,
        )
        .map((obj: any) => obj.refreshtoken) || [];

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
