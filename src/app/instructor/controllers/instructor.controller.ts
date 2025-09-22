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

import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { UserRole } from 'src/app/user/user.interface';
import { QueryString } from 'src/app/database/dbquery';
import { IdParam } from 'src/app/common/decorators/idParam.decorator';
import { InstructorService } from '../services/instructor.service';

@Controller('instructor')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  /**
   * Enroll in a course
   */
  @Get('earnings')
  async getInstructorEarnings(@Req() req: CustomRequest) {
    return this.instructorService.getInstructorBalance(req);
  }

  @Get('analytics')
  async getInstructorAnalytics(@Query() query: any, @Req() req: CustomRequest) {
    return this.instructorService.getInstructorAnalytics(query, req);
  }
}
