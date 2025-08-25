import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { EnrollmentService } from '../enrollment/enrollment.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  /**
   * Paystack Webhook → called automatically by Paystack after payment
   */
  @Post('paystack/webhook')
  async paystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    console.log('Paystack webhook received:', body);

    const result = this.paymentService.validatePaystackWebhook(body, signature);

    if (result?.status === 'success') {
      await this.enrollmentService.enrollStudentAfterPayment(
        result.studentId,
        result.courseId,
        result.reference,
      );
    }

    return { received: true };
  }

  /**
   * Monnify Webhook → called automatically by Monnify after payment
   */
  @Post('monnify/webhook')
  async monnifyWebhook(@Body() body: any) {
    console.log('Monnify webhook received:', body);

    const result = this.paymentService.validateMonnifyWebhook(body);

    if (result?.status === 'success') {
      await this.enrollmentService.enrollStudentAfterPayment(
        result.studentId,
        result.courseId,
        result.reference,
      );
    }

    return { received: true };
  }
}
