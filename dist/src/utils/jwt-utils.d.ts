import { UserRole } from 'src/app/user/user.interface';
export interface JwtPayload {
    id: string;
    role: UserRole;
}
export declare const generateAccessToken: (id: string, role: UserRole, secret: string) => Promise<string>;
export declare const generateRefreshToken: (id: string, role: UserRole, secret: string) => Promise<string>;
export declare const verifyRefreshToken: (refreshToken: string, sessions: string[], accessTokenSecret: string, refreshTokenSecret: string) => Promise<{
    status: string;
    message?: string;
    newToken?: string;
}>;
