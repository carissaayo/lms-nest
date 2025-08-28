import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';

import { EmailService } from '../email/email.service';

import { StudentModule } from '../student/student.module';
import { EnrollmentService } from '../enrollment/services/enrollment.service';
import { Enrollment } from '../enrollment/enrollment.entity';
import { UserAdmin } from '../admin/admin.entity';

import { Earning } from '../instructor/entities/earning.entity';
import { Payment } from '../payment/payment.entity';
import { InstructorService } from './services/instructor.service';
import { InstructorController } from './controllers/instructor.controller';
import { WithdrawalService } from './services/withdrawal.service';
import { WithdrawalController } from './controllers/withdrawal.controller';
import { Bank } from './entities/bank.entity';
import { PaymentModule } from '../payment/payment.module';
import { Otp } from './entities/otp.entity';
import { Withdrawal } from './entities/withdrawal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Enrollment,
      UserAdmin,
      Payment,
      Earning,
      Bank,
      Otp,
      Withdrawal,
    ]),
    StudentModule,
    PaymentModule,
  ],
  providers: [InstructorService, EmailService, WithdrawalService],
  controllers: [InstructorController, WithdrawalController],
  exports: [],
})
export class InstructorModule {}
