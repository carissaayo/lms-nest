import { CustomRequest } from 'src/utils/auth-utils';
import { AdminPaymentsService } from '../services/admin-payments.service';
import { QueryString } from 'src/app/database/dbquery';
export declare class AdminPaymentsController {
    private adminPaymentsService;
    constructor(adminPaymentsService: AdminPaymentsService);
    getPayments(query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        payments: import("../../payment/payment.entity").Payment[];
        message: string;
    }>;
    getWithdrawals(query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        withdrawals: import("../../instructor/entities/withdrawal.entity").Withdrawal[];
        message: string;
    }>;
}
