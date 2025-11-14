import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SecurityModule } from 'src/security/security.module';

import { CourseService } from './services/course.service';
import { InstructorCourseService } from './services/instructor-course.service';
import { StudentCourseService } from './services/student-course.service';
import { EmailService } from '../email/email.service';

import { StudentCourseController } from './controllers/student-course.controller';
import { CourseController } from './controllers/course.controller';

import { InstructorCourseController } from './controllers/instructor-course.controller';

import { Category, CategorySchema } from 'src/models/main.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';
import { Enrollment, EnrollmentSchema } from 'src/models/enrollment.schema';
import { LessonProgress, LessonProgressSchema } from 'src/models/lesson-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
      { name: Lesson.name, schema: LessonSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: LessonProgress.name, schema: LessonProgressSchema },
    ]),
    SecurityModule,
  ],
  providers: [
    CourseService,
    InstructorCourseService,
    StudentCourseService,
    EmailService,
  ],
  controllers: [
    CourseController,
    InstructorCourseController,
    StudentCourseController,
  ],
  exports: [CourseService],
})
export class CourseModule {}
