import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { customError } from 'libs/custom-handlers';
import config from 'src/app/config/config';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

const appConfig = config();
@Injectable()
export class PaymentService {
  private paystackSecret = appConfig.paystack.secret_key;
  private monnifySecret = process.env.MONNIFY_SECRET_KEY;
  private monnifyApiKey = process.env.MONNIFY_API_KEY;
  private monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;

  // private readonly logger = new Logger(MonnifyService.name);
  private readonly baseUrl: string = `https://sandbox.monnify.com`;
  private readonly apiKey: string;
  private readonly secretKey: string;

  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private readonly configService: ConfigService) {
    // this.baseUrl =
    //   this.configService.get<string>('monify.baseUrl') ||
    //   'https://sandbox.monnify.com';
    // this.apiKey = this.configService.get<string>('monify.apiKey');
    // this.secretKey = this.configService.get<string>('monify.secretKey');
  }

  /**
   * Generate Monnify access token and cache it until expiry.
   */
  async generateToken() {
    try {
      // Check if token exists and is still valid
      if (
        this.accessToken &&
        this.tokenExpiry &&
        Date.now() < this.tokenExpiry
      ) {
        return {
          isValid: true,
          accessToken: this.accessToken,
          message: 'Using cached access token',
        };
      }

      const credentials = `${appConfig.monnify.api_key}:${appConfig.monnify.secret_key}`;
      const encodedCredentials = Buffer.from(credentials).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/api/v1/auth/login`,
        {},
        {
          headers: {
            Authorization: `Basic ${encodedCredentials}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { requestSuccessful, responseBody, responseMessage } =
        response.data;

      if (!requestSuccessful || !responseBody) {
        return {
          isValid: false,
          message: responseMessage || 'Verification failed',
        };
      }

      this.accessToken = responseBody.accessToken;
      // Monnify returns expiresIn as seconds → convert to ms
      this.tokenExpiry = Date.now() + responseBody.expiresIn * 1000;
      console.log('this', this.accessToken);

      return {
        isValid: true,
        accessToken: this.accessToken,
        message: 'Access token generated successfully',
      };
    } catch (err) {
      // this.logger.error('generateToken error', err);
      // return {
      //   isValid: false,
      //   message: 'Error during token generation',
      // };
      console.log(err);
      throw customError.internalServerError(err.message);
    }
  }
  /**
   * Fetch all supported banks from Monnify
   */
  async getNigierianBanks(): Promise<{
    isValid: boolean;
    data?: any[];
    message: string;
  }> {
    try {
      //   // Ensure valid token
      const tokenResult = await this.generateToken();
      console.log('token', tokenResult);

      if (!tokenResult.isValid || !tokenResult.accessToken) {
        return { isValid: false, message: 'Unable to generate access token' };
      }

      // Force token into a single line
      const cleanToken = tokenResult.accessToken
        .replace(/(\r\n|\n|\r)/gm, '')
        .trim();

      console.log('Sanitized token (first 50 chars):', cleanToken.slice(0, 50));

      const response = await axios.get(`${this.baseUrl}/api/v1/banks`, {
        headers: {
          Authorization: 'Bearer ' + cleanToken,
          'Content-Type': 'application/json',
        },
      });

      const { requestSuccessful, responseBody, responseMessage } =
        response.data;

      if (!requestSuccessful || !responseBody) {
        return {
          isValid: false,
          message: responseMessage || 'Failed to fetch banks',
        };
      }

      return {
        isValid: true,
        data: responseBody, // contains array of { name, code }
        message: responseMessage,
      };
    } catch (err) {
      // this.logger.error('getBanks error', err);
      // return {
      //   isValid: false,
      //   message: 'Error fetching banks',
      // };
      throw customError.internalServerError(err.message);
    }
  }

  /**
   * Verify a bank account with Monnify.
   */
  async verifyBankAccount(
    accountNumber: string,
    bankCode: string,
  ): Promise<{ isValid: boolean; data?: any; message: string }> {
    try {
      // Ensure we have a valid token
      const tokenResult = await this.generateToken();
      if (!tokenResult.isValid || !tokenResult.accessToken) {
        return { isValid: false, message: 'Unable to generate access token' };
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { requestSuccessful, responseBody, responseMessage } =
        response.data;

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
    } catch (err) {
      // this.logger.error('verifyBankAccount error', err);
      return {
        isValid: false,
        message: 'Error during verification',
      };
    }
  }
  async initPaystackPayment(
    email: string,
    amount: number,
    callbackUrl: string,
    courseId: string,
    studentId: string,
  ) {
    const baseUrl = appConfig.paystack.url || `https://api.paystack.co`;

    const response = await axios.post(
      `${baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        callback_url: callbackUrl,
        metadata: { courseId, studentId },
      },
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecret}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data; // contains authorization_url
  }

  validatePaystackWebhook(rawBody: Buffer, signature: string): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY!;
    const hash = createHmac('sha512', secret)
      .update(rawBody) // Buffer works here
      .digest('hex');

    return hash === signature;
  }
  async initiateTransfer({
    accountNumber,
    bankCode,
    amount,
    accountName,
  }: {
    accountNumber: string;
    bankCode: string;
    amount: number;
    accountName: string;
  }) {
    // Example for Paystack
    const res = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        reason: 'Instructor withdrawal',
        amount: Math.round(amount * 100), // in kobo
        recipient: {
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        },
      }),
    });

    if (!res.ok) throw new Error('Transfer failed');
    return await res.json();
  }
  /**
   * ------------------------
   * MONNIFY
   * ------------------------
   */

  private async getMonnifyToken() {
    const auth = Buffer.from(
      `${this.monnifyApiKey}:${this.monnifySecret}`,
    ).toString('base64');

    const tokenResponse = await axios.post(
      'https://sandbox.monnify.com/api/v1/auth/login',
      {},
      { headers: { Authorization: `Basic ${auth}` } },
    );

    return tokenResponse.data.responseBody.accessToken;
  }

  async initMonnifyPayment(
    email: string,
    amount: number,
    courseId: string,
    studentId: string,
    callbackUrl: string,
  ) {
    const accessToken = await this.getMonnifyToken();

    const paymentReference = `${courseId}-${studentId}-${Date.now()}`;

    const response = await axios.post(
      'https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction',
      {
        amount,
        customerName: email,
        customerEmail: email,
        paymentReference,
        paymentDescription: `Payment for course ${courseId}`,
        currencyCode: 'NGN',
        contractCode: this.monnifyContractCode,
        redirectUrl: callbackUrl,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data; // contains checkoutUrl
  }

  async verifyMonnifyPayment(reference: string) {
    const accessToken = await this.getMonnifyToken();

    const response = await axios.get(
      `https://sandbox.monnify.com/api/v1/merchant/transactions/query?paymentReference=${reference}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data;
  }

  validateMonnifyWebhook(body: any) {
    // Monnify usually sends a JSON body with transaction details
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
}
