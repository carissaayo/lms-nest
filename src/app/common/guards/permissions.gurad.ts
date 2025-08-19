import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { UserAdmin } from 'src/app/admin/admin.entity';
import { JwtPayload } from 'src/utils/jwt-utils';
import { customError } from 'libs/custom-handlers';
import * as jwt from 'jsonwebtoken';
import config from 'src/app/config/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

const appConfig = config();

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw customError.unauthorized('Access token is missing');
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, appConfig.jwt.access_token) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw customError.unauthorized('Access token has expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw customError.badRequest('Invalid access token');
      }
      throw err;
    }

    request.user = decoded;

    if (!requiredPermissions) return true;

    const admin = decoded as UserAdmin;

    if (!admin.permissions || admin.permissions.length === 0) {
      throw customError.forbidden('No permissions assigned yet');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      admin.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw customError.forbidden(
        `You lack the required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
