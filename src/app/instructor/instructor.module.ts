import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StudentModule } from '../student/student.module';
import { PaymentModule } from '../payment/payment.module';

import { EmailService } from '../email/email.service';
import { InstructorService } from './services/instructor.service';
import { WithdrawalService } from './services/withdrawal.service';

import { InstructorController } from './controllers/instructor.controller';
import { WithdrawalController } from './controllers/withdrawal.controller';

import { User, UserSchema } from '../models/user.schema';
import { UserAdmin, UserAdminSchema } from '../models/admin.schema';
import { Payment, PaymentSchema } from '../models/payment.schema';
import { Enrollment, EnrollmentSchema } from '../models/enrollment.schema';
import { Earning, EarningSchema } from '../models/earning.schema';
import { Bank, BankSchema } from '../models/bank.schema';
import { Withdrawal, WithdrawalSchema } from '../models/withdrawal.schema';
import { Otp, OtpSchema } from '../models/otp.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAdmin.name, schema: UserAdminSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Earning.name, schema: EarningSchema },
      { name: Bank.name, schema: BankSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    StudentModule,
    PaymentModule,
  ],
  providers: [InstructorService, EmailService, WithdrawalService],
  controllers: [InstructorController, WithdrawalController],
  exports: [],
})
export class InstructorModule {}
