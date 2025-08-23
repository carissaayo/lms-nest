import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CustomRequest } from 'src/utils/auth-utils';
import { StudentService } from '../services/student.service';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  /**
   * Enroll in a course
   */
  @Post('enroll/:courseId')
  async enroll(@Param('courseId') courseId: string, @Req() req: CustomRequest) {
    return this.studentService.enroll(courseId, req);
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
