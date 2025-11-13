import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SecurityModule } from 'src/security/security.module';

import { EnrollmentModule } from '../enrollment/enrollment.module';

import { EmailService } from '../email/email.service';
import { StudentService } from './services/student.service';
import { PaymentService } from '../payment/services/payment.service.';
import { AssignmentService } from '../assignment/services/assignment.service';

import { StudentController } from './controllers/student.controller';
import { User, UserSchema } from 'src/models/user.schema';
import { Assignment, AssignmentSchema } from 'src/models/assignment.schema';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';
import { Enrollment, EnrollmentSchema } from 'src/models/enrollment.schema';
import { Submission, SubmissionSchema } from 'src/models/submission.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from 'src/models/lesson-progress.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Payment, PaymentSchema } from 'src/models/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Submission.name, schema: SubmissionSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    EnrollmentModule,
    SecurityModule,
  ],
  providers: [StudentService, EmailService, PaymentService, AssignmentService],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule {}
