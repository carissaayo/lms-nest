import { Module } from '@nestjs/common';

import { EmailService } from '../email/email.service';

import { PaymentService } from './services/payment.service.';
import { PaymentController } from './controllers/payment.controller';

import { StudentModule } from '../student/student.module';
import { EnrollmentService } from '../enrollment/services/enrollment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { UserAdmin, UserAdminSchema } from '../models/admin.schema';
import { Payment, PaymentSchema } from '../models/payment.schema';
import { Enrollment, EnrollmentSchema } from '../models/enrollment.schema';
import { Earning, EarningSchema } from '../models/earning.schema';
import { Course, CourseSchema } from '../models/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAdmin.name, schema: UserAdminSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Earning.name, schema: EarningSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
    StudentModule,
  ],
  providers: [PaymentService, EnrollmentService, EmailService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
