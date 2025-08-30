import { CustomRequest } from 'src/utils/auth-utils';
import { AddAnAdminDTO, AssignPermissionsDTO, SuspendUserDTO } from '../admin.dto';
import { AdminAdminsService } from '../services/admin-admins.service';
export declare class AdminAdminsController {
    private adminAdminService;
    constructor(adminAdminService: AdminAdminsService);
    viewProfile(req: CustomRequest): Promise<{
        accessToken: string | undefined;
        profile: import("../admin.interface").AdminProfileInterface;
        message: string;
    }>;
    addAdminByEmail(dto: AddAnAdminDTO, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        message: string;
    }>;
    suspendUser(userId: string, suspendDto: SuspendUserDTO, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    assignPermission(userId: string, dto: AssignPermissionsDTO, req: CustomRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
}
