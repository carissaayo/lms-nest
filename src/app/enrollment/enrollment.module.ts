import { Module } from '@nestjs/common';

import { SecurityModule } from 'src/security/security.module';

import { EmailService } from '../email/email.service';

import { EnrollmentService } from './services/enrollment.service';
import { PaymentService } from '../payment/services/payment.service.';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.schema';
import { UserAdmin, UserAdminSchema } from 'src/models/admin.schema';
import { Payment, PaymentSchema } from 'src/models/payment.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';
import { Earning, EarningSchema } from 'src/models/earning.schema';
import { Enrollment, EnrollmentSchema } from 'src/models/enrollment.schema';

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
    SecurityModule,
  ],
  providers: [EnrollmentService, EmailService, PaymentService],
  controllers: [],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
