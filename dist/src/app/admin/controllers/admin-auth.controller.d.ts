import { ChangePasswordDTO, LoginDto, RegisterDto, RequestResetPasswordDTO, ResetPasswordDTO, VerifyEmailDTO } from '../../auth/auth.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { AdminAuthService } from '../services/admin-auth.service';
import { UserRole } from 'src/app/user/user.interface';
export declare class AdminAuthController {
    private authService;
    constructor(authService: AdminAuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            email: string;
            phoneNumber: string;
            firstName: string;
            lastName: string;
            emailVerified: boolean;
            role: UserRole;
            id: string;
        };
    }>;
    login(loginDto: LoginDto, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        profile: import("../admin.interface").AdminProfileInterface;
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: import("../admin.interface").AdminProfileInterface;
        message: string;
    }>;
    passwordResetRequest(resetPasswordDto: RequestResetPasswordDTO): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDTO): Promise<{
        message: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDTO, req: CustomRequest): Promise<{
        message: string;
    }>;
}
