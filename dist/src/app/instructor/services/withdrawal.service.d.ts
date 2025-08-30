import { Bank } from '../entities/bank.entity';
import { Repository } from 'typeorm';
import { Earning } from '../entities/earning.entity';
import { User } from 'src/app/user/user.entity';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { AddBankDto, ConfirmWithdrawDto, WithdrawDto } from '../dtos/withdrawal.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { EmailService } from 'src/app/email/email.service';
import { Withdrawal } from '../entities/withdrawal.entity';
import { Otp } from '../entities/otp.entity';
import { QueryString } from 'src/app/database/dbquery';
export declare class WithdrawalService {
    private bankRepo;
    private earningRepo;
    private userRepo;
    private withdrawalRepo;
    private otpRepo;
    private paymentProvider;
    private readonly emailService;
    constructor(bankRepo: Repository<Bank>, earningRepo: Repository<Earning>, userRepo: Repository<User>, withdrawalRepo: Repository<Withdrawal>, otpRepo: Repository<Otp>, paymentProvider: PaymentService, emailService: EmailService);
    getSupportedBanks(): Promise<{
        message: string;
        banks: any[] | undefined;
    }>;
    addBank(dto: AddBankDto, req: CustomRequest): Promise<{
        message: string;
        bank: Bank;
    }>;
    getBanks(instructorId: string): Promise<Bank[]>;
    deleteBank(req: CustomRequest, bankId: string): Promise<{
        message: string;
    }>;
    requestWithdrawCode(req: CustomRequest, dto: WithdrawDto): Promise<{
        message: string;
        accesToken: string | undefined;
        withdrawal: Withdrawal;
    }>;
    confirmWithdrawalCode(req: CustomRequest, dto: ConfirmWithdrawDto, withdrawalId: string): Promise<{
        message: string;
        accesToken: string | undefined;
    }>;
    getWithdrawals(query: QueryString, req: CustomRequest): Promise<{
        accessToken: string | undefined;
        page: number | undefined;
        results: number;
        withdrawals: Withdrawal[];
        message: string;
    }>;
}
