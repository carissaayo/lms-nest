import { Module } from '@nestjs/common';

import { EmailService } from '../email/email.service';

import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controllers/assignment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { Course, CourseSchema } from '../models/course.schema';
import { Assignment, AssignmentSchema } from '../models/assignment.schema';
import { Lesson, LessonSchema } from '../models/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  providers: [AssignmentService, EmailService],
  controllers: [AssignmentController],
  exports: [AssignmentService],
})
export class AssignmentModule {}
