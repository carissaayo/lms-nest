import { CustomRequest } from 'src/utils/auth-utils';
import { InstructorService } from '../services/instructor.service';
export declare class InstructorController {
    private readonly instructorService;
    constructor(instructorService: InstructorService);
    getInstructorEarnings(req: CustomRequest): Promise<{
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
