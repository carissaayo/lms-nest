import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { Request } from 'express';
import { StudentService } from './student.service';
import {
  AuthenticatedRequest,
  RolesGuard,
} from '../domain/middleware/role.guard';
import { JwtAuthGuard } from '../domain/middleware/jwt.guard';
import { Role } from '../domain/enums/roles.enum';
import { Roles } from '../domain/middleware/role.decorator';

@Controller('students')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(Role.STUDENT)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':studentId')
  @Roles(Role.STUDENT)
  async getStudentDetails(@Req() req: AuthenticatedRequest) {
    return this.studentService.getStudentDetails(req);
  }

  @Post(':courseId/register')
  async registerForCourse(
    @Param('courseId') courseId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.studentService.registerForCourse(req, courseId);
  }

  @Post(':lectureId/mark-completed')
  @HttpCode(HttpStatus.OK)
  async addCompletedLecture(
    @Param('lectureId') lectureId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { courseId: string },
  ) {
    const courseId = req.body.courseId; // assuming courseId is passed in body
    return this.studentService.addCompletedLecture(
      req,
      lectureId,
      body.courseId,
    );
  }
}
