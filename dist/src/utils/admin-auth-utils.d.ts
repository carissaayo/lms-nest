import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserAdmin } from 'src/app/admin/admin.entity';
import { AdminProfileInterface } from 'src/app/admin/admin.interface';
export interface CustomRequest extends Request {
    verifyAccessToken?: 'nil' | 'failed' | 'success';
    verifyAccessTokenMessage?: string | undefined;
    userId?: string;
    token?: string;
    files?: any;
}
export declare function handleFailedAuthAttempt(admin: UserAdmin, adminRepo: Repository<UserAdmin>): Promise<never>;
export declare const GET_ADMIN_PROFILE: (admin: UserAdmin) => AdminProfileInterface;
