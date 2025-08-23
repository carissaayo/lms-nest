import { Controller, Post, Body, Req } from '@nestjs/common';
import { StudentService } from 'src/app/student/services/student.service';
import { PaymentService } from '../services/payment.service.';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly paymentService: PaymentService,
  ) {}

  @Post('paystack/webhook')
  async paystackWebhook(@Body() body: any) {
    const event = body.event;
    if (event === 'charge.success') {
      const { reference, customer } = body.data;
      // extract courseId from metadata if you passed it earlier
      // auto-enroll student here
    }
    return { received: true };
  }

  @Post('monnify/webhook')
  async monnifyWebhook(@Body() body: any) {
    if (body.eventType === 'SUCCESSFUL_TRANSACTION') {
      const { paymentReference, customerEmail } = body.eventData;
      // auto-enroll student here
    }
    return { received: true };
  }
}
