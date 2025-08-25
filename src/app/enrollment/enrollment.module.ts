import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailService } from '../email/email.service';

import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { EnrollmentService } from './services/enrollment.service';
import { PaymentService } from '../payment/services/payment.service.';
import { Enrollment } from '../database/main.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User, Enrollment])],
  providers: [EnrollmentService, EmailService, PaymentService],
  controllers: [],
  exports: [EnrollmentService],
})
export class EnrollmentModule {}
