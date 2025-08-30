import { CustomRequest } from 'src/utils/auth-utils';
import { AdminUserService } from '../services/admin-users.service';
import { SuspendUserDTO } from '../admin.dto';
export declare class AdminUserController {
    private adminUserService;
    constructor(adminUserService: AdminUserService);
    suspendUser(userId: string, suspendDto: SuspendUserDTO, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
}
