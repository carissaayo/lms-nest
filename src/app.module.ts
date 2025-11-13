import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import config from './app/config/config';

import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { CourseModule } from './app/course/course.module';
import { AdminModule } from './app/admin/admin.module';
import { LessonModule } from './app/lesson/lesson.module';
import { AssignmentModule } from './app/assignment/assignment.module';
import { StudentModule } from './app/student/student.module';
import { PaymentModule } from './app/payment/payment.module';
import { InstructorModule } from './app/instructor/instructor.module';
import { SecurityModule } from './security/security.module';

const appConfig = config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(appConfig.mongoUri),
    SecurityModule,
    AuthModule,
    UserModule,
    CourseModule,
    AdminModule,
    LessonModule,
    AssignmentModule,
    StudentModule,
    PaymentModule,
    InstructorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
