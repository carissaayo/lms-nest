import { Repository } from 'typeorm';
import { Request } from 'express';
import { User } from 'src/app/user/user.entity';
import { ProfileInterface } from 'src/app/auth/auth.interface';
import { UserAdmin } from 'src/app/admin/admin.entity';
export interface CustomRequest extends Request {
    verifyAccessToken?: 'nil' | 'failed' | 'success';
    verifyAccessTokenMessage?: string | undefined;
    userId?: string;
    token?: string;
    files?: any;
    ip: string;
    headers: any;
}
export declare function handleFailedAuthAttempt(user: User, usersRepo: Repository<User>): Promise<never>;
export declare const generateToken: (user: User | UserAdmin, req: CustomRequest) => Promise<{
    token: string;
    refreshToken: string;
    session: {
        ipAddress: string;
        userAgent: any;
        date: Date;
        refreshtoken: string;
        active: boolean;
    };
}>;
export declare const GET_PROFILE: (user: any) => ProfileInterface;
