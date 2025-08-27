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

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, User, Enrollment, UserAdmin, Lesson]),
  ],
  providers: [EnrollmentService, EmailService, PaymentService],
  controllers: [],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
