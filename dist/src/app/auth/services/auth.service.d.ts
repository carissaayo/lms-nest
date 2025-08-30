import { Repository } from 'typeorm';
import { EmailService } from 'src/app/email/email.service';
import { ChangePasswordDTO, LoginDto, RegisterDto, RequestResetPasswordDTO, ResetPasswordDTO, VerifyEmailDTO } from '../auth.dto';
import { User } from 'src/app/user/user.entity';
import { ProfileInterface } from '../auth.interface';
import { CustomRequest } from 'src/utils/auth-utils';
export declare class AuthService {
    private usersRepo;
    private emailService;
    constructor(usersRepo: Repository<User>, emailService: EmailService);
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
        profile: ProfileInterface;
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: ProfileInterface;
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
