import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Assignment } from '../assignment/assignment.entity';
import { Lesson } from '../lesson/lesson.entity';

import { Submission } from '../submission/submission.entity';

import { EmailService } from '../email/email.service';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { PaymentService } from '../payment/services/payment.service.';
import { AssignmentService } from '../assignment/services/assignment.service';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { Enrollment } from '../enrollment/enrollment.entity';
import { LessonProgress } from '../lesson/lesson-progress.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      User,
      Assignment,
      Lesson,
      Enrollment,
      Submission,
      LessonProgress,
    ]),
    EnrollmentModule,
  ],
  providers: [StudentService, EmailService, PaymentService, AssignmentService],
  controllers: [StudentController],
  exports: [StudentService, TypeOrmModule],
})
export class StudentModule {}
