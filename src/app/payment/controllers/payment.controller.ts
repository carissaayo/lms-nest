import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { PaymentService } from '../services/payment.service.';
import { EnrollmentService } from 'src/app/enrollment/services/enrollment.service';
import { CustomRequest } from 'src/utils/auth-utils';
import { EnrollStudentAfterPayment } from 'src/app/enrollment/enrollment.dto';

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
    @Body() dto: EnrollStudentAfterPayment,
    @Req() req: CustomRequest,
    @Headers('x-paystack-signature') signature: string,
  ) {
    console.log('Paystack webhook received:', dto);

    const result = this.paymentService.validatePaystackWebhook(dto, signature);

    if (result?.status === 'success') {
      await this.enrollmentService.enrollStudentAfterPayment(dto, req);
    }

    return { received: true };
  }

  /**
   * Monnify Webhook → called automatically by Monnify after payment
   */
  @Post('monnify/webhook')
  async monnifyWebhook(
    @Body() dto: EnrollStudentAfterPayment,
    @Req() req: CustomRequest,
  ) {
    console.log('Monnify webhook received:', dto);

    const result = this.paymentService.validateMonnifyWebhook(dto);

    if (result?.status === 'success') {
      await this.enrollmentService.enrollStudentAfterPayment(dto, req);
    }

    return { received: true };
  }
}
