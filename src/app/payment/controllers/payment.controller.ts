import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StudentService } from 'src/app/student/services/student.service';
import { PaymentService } from '../services/payment.service.';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly studentService: StudentService,
  ) {}

  @Post('paystack/webhook')
  async paystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const result = this.paymentService.validatePaystackWebhook(body, signature);

    if (result?.status === 'success') {
      await this.studentService.enrollStudentInCourse(
        result.studentId,
        result.courseId,
      );
    }

    return { received: true };
  }

  @Post('monnify/webhook')
  async monnifyWebhook(@Body() body: any) {
    const result = this.paymentService.validateMonnifyWebhook(body);

    if (result?.status === 'success') {
      await this.studentService.enrollStudentInCourse(
        result.studentId,
        result.courseId,
      );
    }

    return { received: true };
  }
}
