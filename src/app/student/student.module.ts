import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EnrollmentModule } from '../enrollment/enrollment.module';

import { EmailService } from '../email/email.service';
import { StudentService } from './services/student.service';
import { PaymentService } from '../payment/services/payment.service.';
import { AssignmentService } from '../assignment/services/assignment.service';

import { StudentController } from './controllers/student.controller';
import { User, UserSchema } from '../models/user.schema';
import { Assignment, AssignmentSchema } from '../models/assignment.schema';
import { Lesson, LessonSchema } from '../models/lesson.schema';
import { Enrollment, EnrollmentSchema } from '../models/enrollment.schema';
import { Submission, SubmissionSchema } from '../models/submission.schema';
import {
  LessonProgress,
  LessonProgressSchema,
} from '../models/lesson-progress.schema';
import { Course, CourseSchema } from '../models/course.schema';

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
    ]),
    EnrollmentModule,
  ],
  providers: [StudentService, EmailService, PaymentService, AssignmentService],
  controllers: [StudentController],
  exports: [StudentService],
})
export class StudentModule {}
