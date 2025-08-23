import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Assignment } from '../assignment/assignment.entity';
import { Lesson } from '../lesson/lesson.entity';

import { EmailService } from '../email/email.service';
import { StudentController } from './controllers/student.controller';
import { StudentService } from './services/student.service';
import { Enrollment } from '../database/main.entity';
import { Submission } from '../submission/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      User,
      Assignment,
      Lesson,
      Enrollment,
      Submission,
    ]),
  ],
  providers: [StudentService, EmailService],
  controllers: [StudentController],
  exports: [StudentService, TypeOrmModule],
})
export class StudentModule {}
