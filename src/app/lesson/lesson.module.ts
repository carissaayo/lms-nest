import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SecurityModule } from 'src/security/security.module';

import { LessonService } from './services/lesson.service';
import { EmailService } from '../email/email.service';

import { LessonController } from './controllers/lesson.controller';

import { Category, CategorySchema } from 'src/models/main.schema';
import { User, UserSchema } from 'src/models/user.schema';
import { Course, CourseSchema } from 'src/models/course.schema';
import { Lesson, LessonSchema } from 'src/models/lesson.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Lesson.name, schema: LessonSchema },
    ]),
        SecurityModule,
    
  ],
  providers: [LessonService, EmailService],
  controllers: [LessonController],
  exports: [LessonService],
})
export class LessonModule {}
