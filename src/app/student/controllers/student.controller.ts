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

  @Post('courses/:courseId')
  async getLessons(
    @Param('courseId') courseId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.studentService.getLessonsForStudent(courseId, query, req);
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
