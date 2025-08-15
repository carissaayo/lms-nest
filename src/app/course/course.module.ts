import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';

import { Category } from '../database/main.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Category, User])],
  providers: [CourseService],
  controllers: [CourseController],
  exports: [CourseService, TypeOrmModule],
})
export class CourseModule {}
