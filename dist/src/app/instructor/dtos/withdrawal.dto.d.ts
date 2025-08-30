export declare class AddBankDto {
    accountNumber: string;
    bankName: string;
    bankCode: string;
}
export declare class WithdrawDto {
    bankId: string;
    amount: number;
}
export declare class ConfirmWithdrawDto {
    code: string;
}
