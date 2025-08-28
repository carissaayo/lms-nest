import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailService } from '../email/email.service';

import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { EnrollmentService } from './services/enrollment.service';
import { PaymentService } from '../payment/services/payment.service.';
import { Enrollment } from './enrollment.entity';
import { UserAdmin } from '../admin/admin.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Payment } from '../payment/payment.entity';
import { Earning } from '../instructor/entities/earning.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      User,
      Enrollment,
      UserAdmin,
      Lesson,
      Payment,
      Earning,
    ]),
  ],
  providers: [EnrollmentService, EmailService, PaymentService],
  controllers: [],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
