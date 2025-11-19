import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  CanActivate,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsEnum } from 'src/app/admin/admin.interface';
import { customError } from 'src/libs/custom-handlers';





export const RequirePermissions = (...permissions: PermissionsEnum[]) =>
  SetMetadata('permissions', permissions);


export const RequireAllPermissions = (...permissions: PermissionsEnum[]) =>
  SetMetadata('all-permissions', permissions);


export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);


@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from decorator
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionsEnum[]
    >('permissions', [context.getHandler(), context.getClass()]);

    const requiredAllPermissions = this.reflector.getAllAndOverride<
      PermissionsEnum[]
    >('all-permissions', [context.getHandler(), context.getClass()]);

    // If no permissions specified, allow access
    if (!requiredPermissions && !requiredAllPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    const userPermissions: string[] = user.permissions || [];

    // Check "any of" permissions
    if (requiredPermissions) {
      const hasAnyPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAnyPermission) {
        throw customError.forbidden(
           'You do not have any permission yet');
      }
    }

    // Check "all of" permissions
    if (requiredAllPermissions) {
      const hasAllPermissions = requiredAllPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
         throw customError.forbidden('Insufficient permissions');
      }
    }

    this.logger.debug('✅ Permission check passed');
    return true;
  }
}
