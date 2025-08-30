import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/app/user/user.entity';
export declare class AuthenticateTokenUserGuard implements CanActivate {
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare class ReIssueTokenUserGuard implements CanActivate {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
