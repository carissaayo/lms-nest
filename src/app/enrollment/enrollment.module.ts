import { Module } from '@nestjs/common';

import { EmailService } from '../email/email.service';

import { EnrollmentService } from './services/enrollment.service';
import { PaymentService } from '../payment/services/payment.service.';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { UserAdmin, UserAdminSchema } from '../models/admin.schema';
import { Payment, PaymentSchema } from '../models/payment.schema';
import { Course, CourseSchema } from '../models/course.schema';
import { Lesson, LessonSchema } from '../models/lesson.schema';
import { Earning, EarningSchema } from '../models/earning.schema';
import { Enrollment, EnrollmentSchema } from '../models/enrollment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAdmin.name, schema: UserAdminSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Earning.name, schema: EarningSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
    ]),
  ],
  providers: [EnrollmentService, EmailService, PaymentService],
  controllers: [],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
