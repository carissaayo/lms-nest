import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  CanActivate,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsEnum } from 'src/app/admin/admin.interface';





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
        throw new ForbiddenException({
          message: 'Insufficient permissions',
          required: requiredPermissions,
          userHas: userPermissions,
          type: 'requires_any',
        });
      }
    }

    // Check "all of" permissions
    if (requiredAllPermissions) {
      const hasAllPermissions = requiredAllPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredAllPermissions.filter(
          (permission) => !userPermissions.includes(permission),
        );

        throw new ForbiddenException({
          message: 'Insufficient permissions - missing required permissions',
          required: requiredAllPermissions,
          missing: missingPermissions,
          userHas: userPermissions,
          type: 'requires_all',
        });
      }
    }

    this.logger.debug('✅ Permission check passed');
    return true;
  }
}
