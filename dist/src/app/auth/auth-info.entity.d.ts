export declare class AuthInfo {
    nextAuthDate?: Date;
    failedAuthAttempts: number;
    nextPasswordResetDate?: Date;
    failedPasswordResetAttempts: number;
    passwordResetCode?: string;
    nextEmailVerifyDate?: Date;
    failedEmailVerifyAttempts: number;
    emailVerifyCode?: string;
    isSignedUp: boolean;
}
