import { Module } from '@nestjs/common';

import { SecurityModule } from 'src/security/security.module';

import { CourseService } from './services/course.service';
import { InstructorCourseService } from './services/instructor-course.service';

import { CourseController } from './controllers/course.controller';

import { InstructorCourseController } from './controllers/instructor-course.controller';

import { Category, CategorySchema } from 'src/models/main.schema';

import { EmailService } from '../email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/models/user.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';

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
  providers: [CourseService, InstructorCourseService, EmailService],
  controllers: [CourseController, InstructorCourseController],
  exports: [CourseService],
})
export class CourseModule {}
