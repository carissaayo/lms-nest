import { PermissionsEnum } from './admin.interface';
import { UserRole } from '../user/user.interface';
export declare enum AdminStatus {
    PENDING = "pending",
    APPPROVED = "approved",
    REJECTED = "rejected"
}
export declare class UserAdmin {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    state: string;
    role: UserRole;
    city: string;
    address: string;
    picture: string;
    phoneNumber: string;
    password: string;
    emailVerified: boolean;
    emailCode: string | null;
    passwordResetCode?: string | null;
    resetPasswordExpires: Date | null;
    isActive: boolean;
    ipAddress: string;
    userAgent: string;
    permissions: PermissionsEnum[];
    signUpDate: Date;
    lastSeen: Date;
    signedUp: boolean;
    sessions: any[];
    failedSignInAttempts: number;
    status: string;
    updatedAt: Date;
    nextAuthDate?: Date;
    failedAuthAttempts: number;
    nextPasswordResetDate?: Date;
    failedPasswordResetAttempts: number;
    nextEmailVerifyDate?: Date;
    failedEmailVerifyAttempts: number;
    nextSignInAttempt: Date | null;
    isSignedUp: boolean;
    passwordResetExpires: Date;
    actions: any[];
    deleted: boolean;
    hashPassword(): Promise<void>;
    hasNewPassword(newPassword: string): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
}
