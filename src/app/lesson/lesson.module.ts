import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Category } from '../database/main.entity';
import { LessonService } from './services/lesson.service';
import { Lesson } from './lesson.entity';
import { EmailService } from '../email/email.service';
import { LessonController } from './controllers/lesson.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Category, User, Lesson])],
  providers: [LessonService, EmailService],
  controllers: [LessonController],
  exports: [LessonService, TypeOrmModule],
})
export class LessonModule {}
