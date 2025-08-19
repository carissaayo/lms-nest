import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { customError } from 'libs/custom-handlers';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PermissionsEnum } from 'src/app/admin/admin.interface';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

import { AdminAdminsService } from 'src/app/admin/services/admin-admins.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly adminService: AdminAdminsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionsEnum[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions) return true;

    const request = context.switchToHttp().getRequest();
    console.log('request', request);

    const user = request.user;
    const { admin } = await this.adminService.findAdminById(user.id);

    if (!admin || !admin.permissions || admin.permissions.length === 0) {
      throw customError.forbidden('No permissions assigned yet');
    }

    if (admin.permissions.includes(PermissionsEnum.SUPER_ADMIN)) {
      return true;
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
