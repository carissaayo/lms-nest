import { Injectable } from '@nestjs/common';
import axios from 'axios';
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
   * Initialize Paystack payment
   */
  async initPaystackPayment(
    email: string,
    amount: number,
    callbackUrl: string,
  ) {
    const baseUrl = appConfig.paystack.url || `https://api.paystack.co`;
    const response = await axios.post(
      `${baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        callback_url: callbackUrl,
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

  /**
   * Verify Paystack payment
   */
  async verifyPaystackPayment(reference: string) {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.paystackSecret}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Initialize Monnify payment
   */
  async initMonnifyPayment(
    email: string,
    amount: number,
    courseId: string,
    callbackUrl: string,
  ) {
    // Step 1: Get access token
    const auth = Buffer.from(
      `${this.monnifyApiKey}:${this.monnifySecret}`,
    ).toString('base64');
    const tokenResponse = await axios.post(
      'https://sandbox.monnify.com/api/v1/auth/login',
      {},
      { headers: { Authorization: `Basic ${auth}` } },
    );

    const accessToken = tokenResponse.data.responseBody.accessToken;

    // Step 2: Initialize transaction
    const response = await axios.post(
      'https://sandbox.monnify.com/api/v1/merchant/transactions/init-transaction',
      {
        amount,
        customerName: email,
        customerEmail: email,
        paymentReference: `${courseId}-${Date.now()}`,
        paymentDescription: `Payment for course ${courseId}`,
        currencyCode: 'NGN',
        contractCode: this.monnifyContractCode,
        redirectUrl: callbackUrl,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data; // contains checkoutUrl
  }

  /**
   * Verify Monnify payment
   */
  async verifyMonnifyPayment(reference: string) {
    const auth = Buffer.from(
      `${this.monnifyApiKey}:${this.monnifySecret}`,
    ).toString('base64');
    const tokenResponse = await axios.post(
      'https://sandbox.monnify.com/api/v1/auth/login',
      {},
      { headers: { Authorization: `Basic ${auth}` } },
    );

    const accessToken = tokenResponse.data.responseBody.accessToken;

    const response = await axios.get(
      `https://sandbox.monnify.com/api/v1/merchant/transactions/query?paymentReference=${reference}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data;
  }
}
