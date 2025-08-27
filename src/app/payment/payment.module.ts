import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

import { EmailService } from '../email/email.service';

import { PaymentService } from './services/payment.service.';
import { PaymentController } from './controllers/payment.controller';

import { StudentModule } from '../student/student.module';
import { EnrollmentService } from '../enrollment/services/enrollment.service';
import { Enrollment } from '../enrollment/enrollment.entity';
import { UserAdmin } from '../admin/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Enrollment, UserAdmin]),
    StudentModule,
  ],
  providers: [PaymentService, EnrollmentService, EmailService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
