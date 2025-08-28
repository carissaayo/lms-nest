import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './app/config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './app/config/database.config';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { CourseModule } from './app/course/course.module';
import { AdminModule } from './app/admin/admin.module';
import { LessonModule } from './app/lesson/lesson.module';
import { AssignmentModule } from './app/assignment/assignment.module';
import { StudentModule } from './app/student/student.module';
import { PaymentModule } from './app/payment/payment.module';
import { InstructorModule } from './app/instructor/instructor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
    }),
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
