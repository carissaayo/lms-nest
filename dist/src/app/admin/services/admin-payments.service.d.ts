import { Repository } from 'typeorm';
import { CustomRequest } from 'src/utils/auth-utils';
import { UserAdmin } from '../admin.entity';
import { EmailService } from '../../email/email.service';
import { QueryString } from 'src/app/database/dbquery';
import { Payment } from 'src/app/payment/payment.entity';
import { Withdrawal } from 'src/app/instructor/entities/withdrawal.entity';
export declare class AdminPaymentsService {
    private adminRepo;
    private paymentRepo;
    private emailService;
    private withdrawalRepo;
    constructor(adminRepo: Repository<UserAdmin>, paymentRepo: Repository<Payment>, emailService: EmailService, withdrawalRepo: Repository<Withdrawal>);
    getPayments(query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        payments: Payment[];
        message: string;
    }>;
    getWithdrawals(query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        withdrawals: Withdrawal[];
        message: string;
    }>;
}
