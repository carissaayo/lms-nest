import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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

const appConfig = config();
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1d' },
          }),
        }),
    MongooseModule.forRoot(appConfig.mongoUri),
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
