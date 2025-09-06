import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { CourseModule } from '../course/course.module';

import { AdminUserService } from './services/admin-users.service';
import { AdminAdminsService } from './services/admin-admins.service';
import { AdminCoursesService } from './services/admin-course.service';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminPaymentsService } from './services/admin-payments.service';

import { AdminAdminsController } from './controllers/admin-admins.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminPaymentsController } from './controllers/admin-payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { UserAdmin, UserAdminSchema } from '../models/admin.schema';
import { Payment, PaymentSchema } from '../models/payment.schema';
import { Withdrawal, WithdrawalSchema } from '../models/withdrawal.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAdmin.name, schema: UserAdminSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
    EmailModule,
    CourseModule,
  ],
  providers: [
    AdminUserService,
    AdminAdminsService,
    AdminCoursesService,
    AdminAuthService,
    AdminPaymentsService,
  ],
  controllers: [
    AdminUserController,
    AdminAdminsController,
    AdminCoursesController,
    AdminAuthController,
    AdminPaymentsController,
  ],
  exports: [],
})
export class AdminModule {}
