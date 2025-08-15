import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/app/user/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { customError } from 'libs/custom-handlers';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log('requiredRoles:', requiredRoles);
    console.log('user.role:', user?.role);
    if (!user) {
      throw customError.forbidden(
        'Access Denied. You do not have the permission',
      );
    }

    if (!requiredRoles.includes(user.role)) {
      throw customError.forbidden(
        'Access Denied. You do not have the permission',
      );
    }
    return requiredRoles.includes(user.role);
  }
}
