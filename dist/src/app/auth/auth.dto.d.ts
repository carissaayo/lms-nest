import { UserRole } from '../user/user.interface';
export declare class RegisterDto {
    firstName: string;
    lastName: string;
    otherName?: string;
    phoneNumber: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class VerifyEmailDTO {
    emailCode: string;
}
export declare class RequestResetPasswordDTO {
    email: string;
}
export declare class ResetPasswordDTO {
    email: string;
    passwordResetCode: string;
    newPassword: string;
    confirmNewPassword: string;
}
export declare class ChangePasswordDTO {
    password: string;
    newPassword: string;
    confirmNewPassword: string;
}
