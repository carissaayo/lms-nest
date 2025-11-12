import { Module } from '@nestjs/common';

import { SecurityModule } from 'src/security/security.module';

import { CourseService } from './services/course.service';
import { CourseController } from './controllers/course.controller';

import { Category, CategorySchema } from '../models/main.schema';

import { EmailService } from '../email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { Course, CourseSchema } from '../models/course.schema';
import { Lesson, LessonSchema } from '../models/lesson.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
    SecurityModule,
  ],
  providers: [CourseService, EmailService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
