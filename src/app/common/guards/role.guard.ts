import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/app/user/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { customError } from 'libs/custom-handlers';
import { JwtPayload } from 'src/utils/jwt-utils';
import * as jwt from 'jsonwebtoken';
import config from 'src/app/config/config';

const appConfig = config();
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw customError.unauthorized('Access token is missing');
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify only against ACCESS TOKEN secret
      const decoded = jwt.verify(
        token,
        appConfig.jwt.access_token,
      ) as JwtPayload;

      // Attach user payload to request
      request.user = decoded;

      return true;
    } catch (err) {
      throw customError.badRequest('Invalid or expired access token');
    }
  }
}
