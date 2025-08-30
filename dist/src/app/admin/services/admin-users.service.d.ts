import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { UserAdmin } from '../admin.entity';
import { User } from '../../user/user.entity';
import { VerifyEmailDTO } from '../../auth/auth.dto';
import { SuspendUserDTO } from '../admin.dto';
import { AdminProfileInterface } from '../admin.interface';
import { CustomRequest } from 'src/utils/auth-utils';
export declare class AdminUserService {
    private adminRepo;
    private userRepo;
    private emailService;
    constructor(adminRepo: Repository<UserAdmin>, userRepo: Repository<User>, emailService: EmailService);
    suspendUser(userId: string, suspendDto: SuspendUserDTO, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: AdminProfileInterface;
        message: string;
    }>;
}
