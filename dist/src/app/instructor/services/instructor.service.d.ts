import { Repository } from 'typeorm';
import { User } from 'src/app/user/user.entity';
import { CustomRequest } from 'src/utils/auth-utils';
import { EmailService } from 'src/app/email/email.service';
import { Earning } from '../entities/earning.entity';
import { Withdrawal } from '../entities/withdrawal.entity';
export declare class InstructorService {
    private readonly userRepo;
    private withdrawalRepo;
    private readonly earningRepo;
    private readonly emailService;
    constructor(userRepo: Repository<User>, withdrawalRepo: Repository<Withdrawal>, earningRepo: Repository<Earning>, emailService: EmailService);
    getInstructorBalance(req: CustomRequest): Promise<{
        totalEarnings: number;
        totalWithdrawals: number;
        availableBalance: number;
        message?: undefined;
        wallet?: undefined;
        accessToken?: undefined;
    } | {
        message: string;
        wallet: {
            availableBalance: number;
            totalEarnings: number;
            totalWithdrawals: number;
        };
        accessToken: string | undefined;
        totalEarnings?: undefined;
        totalWithdrawals?: undefined;
        availableBalance?: undefined;
    }>;
}
