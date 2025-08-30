import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminAdminsService } from 'src/app/admin/services/admin-admins.service';
export declare class PermissionsGuard implements CanActivate {
    private reflector;
    private readonly adminService;
    constructor(reflector: Reflector, adminService: AdminAdminsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
