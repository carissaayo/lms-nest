import { AuthService } from '../services/auth.service';
import { ChangePasswordDTO, LoginDto, RegisterDto, RequestResetPasswordDTO, ResetPasswordDTO, VerifyEmailDTO } from '../auth.dto';
import { CustomRequest } from 'src/utils/auth-utils';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            email: string;
            phoneNumber: string;
            firstName: string;
            lastName: string;
            emailVerified: boolean;
            role: import("../../user/user.interface").UserRole;
            id: string;
        };
    }>;
    login(loginDto: LoginDto, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        profile: import("../auth.interface").ProfileInterface;
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: import("../auth.interface").ProfileInterface;
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
