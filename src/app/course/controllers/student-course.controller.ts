import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
  Query,
  Patch,
  Body,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import { UserRole } from 'src/app/user/user.interface';
import { QueryString } from 'src/app/database/dbquery';

import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { StudentCourseService } from '../services/student-course.service';
import { UpdateLessonProgressDTO } from 'src/app/student/student.dto';

@Controller('student-course')
@UseGuards(RoleGuard)
@RequireRoles(UserRole.STUDENT)
export class StudentCourseController {
  constructor(private readonly studentCourseService: StudentCourseService) {}

  @Get('instructor')
  async getInstructorCourses(
    @Req() req: CustomRequest,
    @Query() query: QueryString,
  ) {
    return this.studentCourseService.viewInstructorCourses(req, query);
  }

  @Get('')
  async viewCourses(@Query() query: string, @Req() req: CustomRequest) {
    return this.studentCourseService.viewCourses(query, req);
  }

  @Get('enrolled')
  async getEnrolledCourses(
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.viewEnrolledCourses(query, req);
  }

  @Get('courses/:courseId')
  async viewSingleEnrolledCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.viewSingleEnrolledCourse(courseId, req);
  }

  @Post('lessons/:courseId/start')
  async startCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.startCourse(courseId, req);
  }

  @Patch('lessons/:courseId/completed')
  async completeCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.completeCourse(courseId, req);
  }
  @Post('lessons/:lessonId/start')
  async startLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.startLesson(lessonId, req);
  }

  @Patch('lessons/:lessonId')
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonProgressDTO,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.updateProgress(lessonId, dto, req);
  }

  @Get('/:courseId')
  async getSingleCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.getSingleCourse(courseId, req);
  }

  @Patch('lessons/:lessonId/completed')
  async completeLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentCourseService.completeLesson(lessonId, req);
  }

  @Patch('lessons/:courseId/completed')
  async calculateCourseProgress(
    @Param('courseId') courseId: string,
    @Body() userId: string,
  ) {
    return this.studentCourseService.calculateCourseProgress(courseId, userId);
  }
}
