import { Repository } from 'typeorm';
import { LoginDto, VerifyEmailDTO } from '../../auth/auth.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { UserAdmin } from '../admin.entity';
import { EmailService } from '../../email/email.service';
import { AdminProfileInterface } from '../admin.interface';
import { AddAnAdminDTO, AssignPermissionsDTO, SuspendUserDTO } from '../admin.dto';
export declare class AdminAdminsService {
    private adminRepo;
    private emailService;
    constructor(adminRepo: Repository<UserAdmin>, emailService: EmailService);
    viewProfile(req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: AdminProfileInterface;
        message: string;
    }>;
    addAdminByEmail(dto: AddAnAdminDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
    }>;
    suspendAdmin(userId: string, suspendDto: SuspendUserDTO, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    assignPermission(userId: string, dto: AssignPermissionsDTO, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
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
    findAdminById(id: string): Promise<{
        admin: UserAdmin | null;
    }>;
}
