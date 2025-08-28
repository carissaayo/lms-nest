import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  Res,
} from '@nestjs/common';
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
    @Req() req: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const rawBody = req.rawBody; // should be Buffer

    const isValid = this.paymentService.validatePaystackWebhook(
      rawBody,
      signature,
    );

    if (isValid) {
      const dto = JSON.parse(rawBody.toString());
      console.log('dto===', dto);

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
