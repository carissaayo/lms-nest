import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

import { EmailService } from '../email/email.service';
import { StudentService } from '../student/services/student.service';
import { PaymentService } from './services/payment.service.';
import { PaymentController } from './controllers/payment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User])],
  providers: [StudentService, EmailService, PaymentService],
  controllers: [PaymentController],
  exports: [StudentService, TypeOrmModule],
})
export class PaymentModule {}
