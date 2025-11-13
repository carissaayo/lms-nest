import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { StudentModule } from '../student/student.module';
import { PaymentModule } from '../payment/payment.module';
import { SecurityModule } from 'src/security/security.module';

import { EmailService } from '../email/email.service';
import { InstructorService } from './services/instructor.service';
import { WithdrawalService } from './services/withdrawal.service';

import { InstructorController } from './controllers/instructor.controller';
import { WithdrawalController } from './controllers/withdrawal.controller';

import { User, UserSchema } from 'src/models/user.schema';
import { UserAdmin, UserAdminSchema } from 'src/models/admin.schema';
import { Payment, PaymentSchema } from 'src/models/payment.schema';
import { Enrollment, EnrollmentSchema } from 'src/models/enrollment.schema';
import { Earning, EarningSchema } from 'src/models/earning.schema';
import { Bank, BankSchema } from 'src/models/bank.schema';
import { Withdrawal, WithdrawalSchema } from 'src/models/withdrawal.schema';
import { Otp, OtpSchema } from 'src/models/otp.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';

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
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    StudentModule,
    PaymentModule,
    SecurityModule,
  ],
  providers: [InstructorService, EmailService, WithdrawalService],
  controllers: [InstructorController, WithdrawalController],
  exports: [],
})
export class InstructorModule {}
