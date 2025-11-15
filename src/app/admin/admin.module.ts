import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailModule } from '../email/email.module';
import { CourseModule } from '../course/course.module';

import { AdminUserService } from './services/admin-users.service';
import { AdminAdminsService } from './services/admin-admins.service';
import { AdminCoursesService } from './services/admin-course.service';
import { AdminAuthService } from './services/admin-auth.service';
import { AdminPaymentsService } from './services/admin-payments.service';
import { AdminInstructorService } from './services/admin-instructor.service';
import { AdminStudentsService } from './services/admin-students.service';

import { AdminInstructorController } from './controllers/admin-instructor.controller';
import { AdminStudentsController } from './controllers/admin-students.controller';
import { AdminAdminsController } from './controllers/admin-admins.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminCoursesController } from './controllers/admin-courses.controller';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminPaymentsController } from './controllers/admin-payment.controller';


import { User, UserSchema } from 'src/models/user.schema';
import { UserAdmin, UserAdminSchema } from 'src/models/admin.schema';
import { Payment, PaymentSchema } from 'src/models/payment.schema';
import { Withdrawal, WithdrawalSchema } from 'src/models/withdrawal.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Earning, EarningSchema } from 'src/models/earning.schema';
import { Enrollment, EnrollmentSchema } from 'src/models/enrollment.schema';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';

import { SecurityModule } from 'src/security/security.module';

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
    SecurityModule
  ],
  providers: [
    AdminUserService,
    AdminAdminsService,
    AdminCoursesService,
    AdminAuthService,
    AdminPaymentsService,
    AdminAnalyticsService,
    AdminInstructorService,
    AdminStudentsService,
  ],
  controllers: [
    AdminUserController,
    AdminAdminsController,
    AdminCoursesController,
    AdminAuthController,
    AdminPaymentsController,
    AdminAnalyticsController,
    AdminInstructorController,
    AdminStudentsController,
  ],
  exports: [],
})
export class AdminModule {}
