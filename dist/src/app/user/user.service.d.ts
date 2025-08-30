import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/auth.dto';
import { UpdateUserDTO } from './user.dto';
import { ProfileInterface } from '../auth/auth.interface';
import { CustomRequest } from 'src/utils/auth-utils';
export declare class UsersService {
    private usersRepo;
    constructor(usersRepo: Repository<User>);
    create(dto: RegisterDto): Promise<User>;
    updateUser(updateProfile: UpdateUserDTO, req: CustomRequest): Promise<{
        accessToken: string;
        profile: ProfileInterface;
        message: string;
    }>;
    viewProfile(req: CustomRequest): Promise<{
        accessToken: string;
        profile: ProfileInterface;
        message: string;
    }>;
}
