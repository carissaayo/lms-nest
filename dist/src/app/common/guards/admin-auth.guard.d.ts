import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserAdmin } from 'src/app/admin/admin.entity';
export declare class AuthenticateTokenAdminGuard implements CanActivate {
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare class ReIssueTokenAdminGuard implements CanActivate {
    private readonly userRepo;
    constructor(userRepo: Repository<UserAdmin>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
