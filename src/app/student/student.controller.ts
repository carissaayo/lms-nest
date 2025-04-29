import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudentService } from './student.service'; // Adjust path based on your project structure
import { Request } from 'express';

@Controller('students')
@UseGuards(AuthGuard('jwt')) // This replaces verifyToken
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':studentId')
  async getStudentDetails(
    @Param('studentId') studentId: string,
    @Req() req: Request,
  ) {
    return this.studentService.getStudentDetails(studentId, req.user);
  }

  @Post(':courseId/register')
  async registerForCourse(
    @Param('courseId') courseId: string,
    @Req() req: Request,
  ) {
    return this.studentService.registerForCourse(courseId, req.user);
  }

  @Post(':lectureId/mark-completed')
  @HttpCode(HttpStatus.OK)
  async addCompletedLecture(
    @Param('lectureId') lectureId: string,
    @Req() req: Request,
  ) {
    const courseId = req.body.courseId; // assuming courseId is passed in body
    return this.studentService.addCompletedLecture(
      lectureId,
      courseId,
      req.user,
    );
  }
}
