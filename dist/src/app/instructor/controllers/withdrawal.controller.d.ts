import { CustomRequest } from 'src/utils/auth-utils';
import { WithdrawalService } from '../services/withdrawal.service';
import { AddBankDto, ConfirmWithdrawDto, WithdrawDto } from '../dtos/withdrawal.dto';
import { QueryString } from 'src/app/database/dbquery';
export declare class WithdrawalController {
    private readonly withdrawalService;
    constructor(withdrawalService: WithdrawalService);
    addBank(dto: AddBankDto, req: CustomRequest): Promise<{
        message: string;
        bank: import("../entities/bank.entity").Bank;
    }>;
    deleteBank(bankId: string, req: CustomRequest): Promise<{
        message: string;
    }>;
    getSupportedBanks(): Promise<{
        message: string;
        banks: any[] | undefined;
    }>;
    requestWithdrawCode(dto: WithdrawDto, req: CustomRequest): Promise<{
        message: string;
        accesToken: string | undefined;
        withdrawal: import("../entities/withdrawal.entity").Withdrawal;
    }>;
    confirmWithdrawalCode(withdrawalId: string, dto: ConfirmWithdrawDto, req: CustomRequest): Promise<{
        message: string;
        accesToken: string | undefined;
    }>;
    getWithdrawals(query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        withdrawals: import("../entities/withdrawal.entity").Withdrawal[];
        message: string;
    }>;
}
