import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LessonService } from './services/lesson.service';
import { EmailService } from '../email/email.service';

import { LessonController } from './controllers/lesson.controller';

import { Category, CategorySchema } from '../models/main.schema';
import { User, UserSchema } from '../models/user.schema';
import { Course, CourseSchema } from '../models/course.schema';
import { Lesson, LessonSchema } from '../models/lesson.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
  ],
  providers: [LessonService, EmailService],
  controllers: [LessonController],
  exports: [LessonService],
})
export class LessonModule {}
