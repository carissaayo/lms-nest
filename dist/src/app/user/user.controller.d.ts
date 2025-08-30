import { CustomRequest } from 'src/utils/auth-utils';
import { UsersService } from './user.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getUserProfile(req: CustomRequest): Promise<{
        accessToken: string;
        profile: import("../auth/auth.interface").ProfileInterface;
        message: string;
    }>;
}
