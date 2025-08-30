import { ConfigService } from '@nestjs/config';
export declare class PaymentService {
    private readonly configService;
    private paystackSecret;
    private monnifySecret;
    private monnifyApiKey;
    private monnifyContractCode;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly secretKey;
    private accessToken;
    private tokenExpiry;
    constructor(configService: ConfigService);
    generateToken(): Promise<{
        isValid: boolean;
        message: any;
        accessToken?: undefined;
    } | {
        isValid: boolean;
        accessToken: string | null;
        message: string;
    }>;
    getNigierianBanks(): Promise<{
        isValid: boolean;
        data?: any[];
        message: string;
    }>;
    verifyBankAccount(accountNumber: string, bankCode: string): Promise<{
        isValid: boolean;
        data?: any;
        message: string;
    }>;
    initPaystackPayment(email: string, amount: number, callbackUrl: string, courseId: string, studentId: string): Promise<any>;
    validatePaystackWebhook(rawBody: Buffer, signature: string): boolean;
    initiateTransfer({ accountNumber, bankCode, amount, accountName, }: {
        accountNumber: string;
        bankCode: string;
        amount: number;
        accountName: string;
    }): Promise<any>;
    private getMonnifyToken;
    initMonnifyPayment(email: string, amount: number, courseId: string, studentId: string, callbackUrl: string): Promise<any>;
    verifyMonnifyPayment(reference: string): Promise<any>;
    validateMonnifyWebhook(body: any): {
        status: string;
        studentId: any;
        courseId: any;
        reference: any;
    } | null;
}
