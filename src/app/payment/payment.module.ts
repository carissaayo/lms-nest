import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

import { EmailService } from '../email/email.service';
import { StudentService } from '../student/services/student.service';
import { PaymentService } from './services/payment.service.';
import { PaymentController } from './controllers/payment.controller';
import { Enrollment } from '../database/main.entity';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), StudentModule],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
