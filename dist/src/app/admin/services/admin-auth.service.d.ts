import { ChangePasswordDTO, LoginDto, RegisterDto, RequestResetPasswordDTO, ResetPasswordDTO, VerifyEmailDTO } from '../../auth/auth.dto';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { CustomRequest } from 'src/utils/auth-utils';
import { UserAdmin } from '../admin.entity';
import { AdminProfileInterface } from '../admin.interface';
export declare class AdminAuthService {
    private usersRepo;
    private emailService;
    constructor(usersRepo: Repository<UserAdmin>, emailService: EmailService);
    register(body: RegisterDto): Promise<{
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
        profile: AdminProfileInterface;
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: AdminProfileInterface;
        message: string;
    }>;
    requestResetPassword(resetPasswordDto: RequestResetPasswordDTO): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDTO): Promise<{
        message: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDTO, req: CustomRequest): Promise<{
        message: string;
    }>;
}
