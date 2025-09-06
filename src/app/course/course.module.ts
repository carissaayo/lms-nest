import { Module } from '@nestjs/common';

import { CourseService } from './services/course.service';
import { CourseController } from './course.controller';

import { Category, CategorySchema } from '../models/main.schema';

import { EmailService } from '../email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/user.schema';
import { Course, CourseSchema } from '../models/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  providers: [CourseService, EmailService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
