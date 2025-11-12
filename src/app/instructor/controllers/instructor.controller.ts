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

import { CustomRequest } from 'src/utils/auth-utils';

import { UserRole } from 'src/app/user/user.interface';

import { InstructorService } from '../services/instructor.service';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';

@Controller('instructor')
@UseGuards(RoleGuard)
@RequireRoles(UserRole.INSTRUCTOR)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  /**
   * Enroll in a course
   */
  @Get('earnings')
  async getInstructorEarnings(@Req() req: CustomRequest) {
    return this.instructorService.getInstructorEarnings(req);
  }

  @Get('analytics')
  async getInstructorAnalytics(@Query() query: any, @Req() req: CustomRequest) {
    return this.instructorService.getInstructorAnalytics(query, req);
  }
  @Get('students')
  async getInstructorStudents(@Query() query: any, @Req() req: CustomRequest) {
    return this.instructorService.getInstructorStudents(query, req);
  }
}
