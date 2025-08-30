"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const custom_handlers_1 = require("../../../../libs/custom-handlers");
const config_1 = __importDefault(require("../../config/config"));
const crypto_1 = require("crypto");
const config_2 = require("@nestjs/config");
const appConfig = (0, config_1.default)();
let PaymentService = class PaymentService {
    constructor(configService) {
        this.configService = configService;
        this.paystackSecret = appConfig.paystack.secret_key;
        this.monnifySecret = process.env.MONNIFY_SECRET_KEY;
        this.monnifyApiKey = process.env.MONNIFY_API_KEY;
        this.monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;
        this.baseUrl = `https://sandbox.monnify.com`;
        this.accessToken = null;
        this.tokenExpiry = null;
    }
    async generateToken() {
        try {
            if (this.accessToken &&
                this.tokenExpiry &&
                Date.now() < this.tokenExpiry) {
                return {
                    isValid: true,
                    accessToken: this.accessToken,
                    message: 'Using cached access token',
                };
            }
            const credentials = `${appConfig.monnify.api_key}:${appConfig.monnify.secret_key}`;
            const encodedCredentials = Buffer.from(credentials).toString('base64');
            const response = await axios_1.default.post(`${this.baseUrl}/api/v1/auth/login`, {}, {
                headers: {
                    Authorization: `Basic ${encodedCredentials}`,
                    'Content-Type': 'application/json',
                },
            });
            const { requestSuccessful, responseBody, responseMessage } = response.data;
            if (!requestSuccessful || !responseBody) {
                return {
                    isValid: false,
                    message: responseMessage || 'Verification failed',
                };
            }
            this.accessToken = responseBody.accessToken;
            this.tokenExpiry = Date.now() + responseBody.expiresIn * 1000;
            console.log('this', this.accessToken);
            return {
                isValid: true,
                accessToken: this.accessToken,
                message: 'Access token generated successfully',
            };
        }
        catch (err) {
            console.log(err);
            throw custom_handlers_1.customError.internalServerError(err.message);
        }
    }
    async getNigierianBanks() {
        try {
            const tokenResult = await this.generateToken();
            console.log('token', tokenResult);
            if (!tokenResult.isValid || !tokenResult.accessToken) {
                return { isValid: false, message: 'Unable to generate access token' };
            }
            const cleanToken = tokenResult.accessToken
                .replace(/(\r\n|\n|\r)/gm, '')
                .trim();
            console.log('Sanitized token (first 50 chars):', cleanToken.slice(0, 50));
            const response = await axios_1.default.get(`${this.baseUrl}/api/v1/banks`, {
                headers: {
                    Authorization: 'Bearer ' + cleanToken,
                    'Content-Type': 'application/json',
                },
            });
            const { requestSuccessful, responseBody, responseMessage } = response.data;
            if (!requestSuccessful || !responseBody) {
                return {
                    isValid: false,
                    message: responseMessage || 'Failed to fetch banks',
                };
            }
            return {
                isValid: true,
                data: responseBody,
                message: responseMessage,
            };
        }
        catch (err) {
            throw custom_handlers_1.customError.internalServerError(err.message);
        }
    }
    async verifyBankAccount(accountNumber, bankCode) {
        try {
            const tokenResult = await this.generateToken();
            if (!tokenResult.isValid || !tokenResult.accessToken) {
                return { isValid: false, message: 'Unable to generate access token' };
            }
            const response = await axios_1.default.get(`${this.baseUrl}/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`, {
                headers: {
                    Authorization: `Bearer ${tokenResult.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const { requestSuccessful, responseBody, responseMessage } = response.data;
            if (!requestSuccessful || !responseBody) {
                return {
                    isValid: false,
                    message: responseMessage || 'Verification failed',
                };
            }
            return {
                isValid: true,
                data: responseBody,
                message: responseMessage,
            };
        }
        catch (err) {
            return {
                isValid: false,
                message: 'Error during verification',
            };
        }
    }
    async initPaystackPayment(email, amount, callbackUrl, courseId, studentId) {
        const baseUrl = appConfig.paystack.url || `https://api.paystack.co`;
        const response = await axios_1.default.post(`${baseUrl}/transaction/initialize`, {
            email,
            amount: amount * 100,
            callback_url: callbackUrl,
            metadata: { courseId, studentId },
        }, {
            headers: {
                Authorization: `Bearer ${this.paystackSecret}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    validatePaystackWebhook(rawBody, signature) {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const hash = (0, crypto_1.createHmac)('sha512', secret)
            .update(rawBody)
            .digest('hex');
        return hash === signature;
    }
    async initiateTransfer({ accountNumber, bankCode, amount, accountName, }) {
        const baseUrl = appConfig.paystack.url || `https://api.paystack.co`;
        const recipientRes = await axios_1.default.post(`${baseUrl}/transferrecipient`, {
            type: 'nuban',
            name: accountName,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'NGN',
        }, {
            headers: {
                Authorization: `Bearer ${this.paystackSecret}`,
                'Content-Type': 'application/json',
            },
        });
        const recipientCode = recipientRes.data.data.recipient_code;
        const transferRes = await axios_1.default.post(`${baseUrl}/transfer`, {
            source: 'balance',
            reason: 'Instructor withdrawal',
            amount: Math.round(amount * 100),
            recipient: recipientCode,
        }, {
            headers: {
                Authorization: `Bearer ${this.paystackSecret}`,
                'Content-Type': 'application/json',
            },
        });
        if (!transferRes.data)
            throw new Error('Transfer failed');
        return transferRes.data;
    }
    async getMonnifyToken() {
        const auth = Buffer.from(`${this.monnifyApiKey}:${this.monnifySecret}`).toString('base64');
        const tokenResponse = await axios_1.default.post('https://sandbox.monnify.com/api/v1/auth/login', {}, { headers: { Authorization: `Basic ${auth}` } });
        return tokenResponse.data.responseBody.accessToken;
    }
    async initMonnifyPayment(email, amount, courseId, studentId, callbackUrl) {
        const accessToken = await this.getMonnifyToken();
        const paymentReference = `${courseId}-${studentId}-${Date.now()}`;
        const response = await axios_1.default.post('https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction', {
            amount,
            customerName: email,
            customerEmail: email,
            paymentReference,
            paymentDescription: `Payment for course ${courseId}`,
            currencyCode: 'NGN',
            contractCode: this.monnifyContractCode,
            redirectUrl: callbackUrl,
        }, { headers: { Authorization: `Bearer ${accessToken}` } });
        return response.data;
    }
    async verifyMonnifyPayment(reference) {
        const accessToken = await this.getMonnifyToken();
        const response = await axios_1.default.get(`https://sandbox.monnify.com/api/v1/merchant/transactions/query?paymentReference=${reference}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        return response.data;
    }
    validateMonnifyWebhook(body) {
        if (body.eventType === 'SUCCESSFUL_TRANSACTION') {
            return {
                status: 'success',
                studentId: body.eventData?.product?.studentId,
                courseId: body.eventData?.product?.courseId,
                reference: body.eventData?.transactionReference,
            };
        }
        return null;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_2.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service..js.map