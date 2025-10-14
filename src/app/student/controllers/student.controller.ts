import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CustomRequest } from 'src/utils/auth-utils';
import { StudentService } from '../services/student.service';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { UserRole } from 'src/app/user/user.interface';
import { QueryString } from 'src/app/database/dbquery';

import { UpdateLessonProgressDTO } from '../student.dto';

@Controller('students')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /**
   * Enroll in a course
   */
  @Post('enroll/:courseId')
  async enroll(@Param('courseId') courseId: string, @Req() req: CustomRequest) {
    return this.studentService.enroll(courseId, req);
  }

  @Get('courses/:courseId/lessons')
  async getLessons(
    @Param('courseId') courseId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.getLessonsForStudent(courseId, query, req);
  }

  @Get('lessons/:lessonId')
  async getALesson(
    @Param('lessonId') lessonId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.getALesson(lessonId, req);
  }
  @Get('courses/:courseId')
  async getCourse(
    @Param('courseId') courseId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.getSingleEnrollmentForStudent(
      courseId,
      query,
      req,
    );
  }
  @Get('courses')
  async getEnrolledCourses(
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.viewEnrolledCourses(query, req);
  }

  @Get('payments')
  async getStudentPayments(
    @Req() req: CustomRequest,
  ) {
    return this.studentService.getStudentPayments(req);
  }

  @Get('analytics')
  async getDetailedAnalytics(
    @Query() query: any,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.getDetailedAnalytics(query,req);
  }
  @Post('lessons/:lessonId/start')
  async startLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.startLesson(lessonId, req);
  }

  @Patch('lessons/:lessonId')
  async updateProgress(
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonProgressDTO,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.updateProgress(lessonId, dto, req);
  }

  @Post('lessons/:lessonId/completed')
  async completeLesson(
    @Param('lessonId') lessonId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.completeLesson(lessonId, req);
  }

  @Post('lessons/:courseId/start')
  async startCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.startCourse(courseId, req);
  }

  @Post('lessons/:courseId/completed')
  async completeCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.completeCourse(courseId, req);
  }
  /**
   * Get assignments for a course
   */
  //   @Get('assignments/:courseId')
  //   async getAssignments(
  //     @Param('courseId') courseId: string,
  //     @Req() req: CustomRequest,
  //   ) {
  //     return this.studentService.getAssignments(courseId, req);
  //   }

  //   /**
  //    * Submit an assignment
  //    */
  //   @Post('submit/:assignmentId')
  //   @UseInterceptors(FileInterceptor('file'))
  //   async submitAssignment(
  //     @Param('assignmentId') assignmentId: string,
  //     @UploadedFile() file: Express.Multer.File,
  //     @Req() req: CustomRequest,
  //   ) {
  //     return this.studentService.submitAssignment(assignmentId, file, req);
  //   }
}
