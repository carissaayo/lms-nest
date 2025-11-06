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
import { Course, CourseSchema } from '../models/course.schema';
import { Earning, EarningSchema } from '../models/earning.schema';
import { Enrollment, EnrollmentSchema } from '../models/enrollment.schema';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { Lesson, LessonSchema } from '../models/lesson.schema';
import { AdminInstructorService } from './services/admin-instructor.service';
import { AdminInstructorController } from './controllers/admin-instructor.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserAdmin.name, schema: UserAdminSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Earning.name, schema: EarningSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Lesson.name, schema: LessonSchema },
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
    AdminAnalyticsService,
    AdminInstructorService,
  ],
  controllers: [
    AdminUserController,
    AdminAdminsController,
    AdminCoursesController,
    AdminAuthController,
    AdminPaymentsController,
    AdminAnalyticsController,
    AdminInstructorController,
  ],
  exports: [],
})
export class AdminModule {}
