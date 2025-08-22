import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailService } from '../email/email.service';
import { Assignment } from './assignment.entity';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Lesson } from '../lesson/lesson.entity';
import { AssignmentService } from './services/assignment.service';
import { AssignmentController } from './controllers/assignment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, User, Assignment, Lesson])],
  providers: [AssignmentService, EmailService],
  controllers: [AssignmentController],
  exports: [AssignmentService, TypeOrmModule],
})
export class AssignmentModule {}
