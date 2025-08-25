import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import config from 'src/app/config/config';

const appConfig = config();

@Injectable()
export class PaymentService {
  constructor() {}

  private paystackSecret = appConfig.paystack.secret_key;
  private monnifySecret = process.env.MONNIFY_SECRET_KEY;
  private monnifyApiKey = process.env.MONNIFY_API_KEY;
  private monnifyContractCode = process.env.MONNIFY_CONTRACT_CODE;

  /**
   * ------------------------
   * PAYSTACK
   * ------------------------
   */

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

  async verifyPaystackPayment(reference: string) {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.paystackSecret}` },
      },
    );
    return response.data;
  }

  validatePaystackWebhook(payload: any, signature: string) {
    const hash = crypto
      .createHmac('sha512', this.paystackSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new BadRequestException('Invalid Paystack signature');
    }

    if (payload.event === 'charge.success') {
      const { reference, customer, metadata, amount } = payload.data;
      return {
        status: 'success',
        reference,
        email: customer?.email,
        amount: amount / 100, // back to Naira
        courseId: metadata?.courseId,
        studentId: metadata?.studentId,
      };
    }

    return null;
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

  validateMonnifyWebhook(payload: any) {
    if (payload.eventType === 'SUCCESSFUL_TRANSACTION') {
      const { paymentReference, customerEmail, amountPaid } = payload.eventData;

      // reference was created as "courseId-studentId-timestamp"
      const [courseId, studentId] = paymentReference.split('-');

      return {
        status: 'success',
        reference: paymentReference,
        email: customerEmail,
        amount: amountPaid,
        courseId,
        studentId,
      };
    }

    return null;
  }
}
