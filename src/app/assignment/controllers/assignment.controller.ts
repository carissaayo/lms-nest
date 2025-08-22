import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Get,
  Patch,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentDTO } from '../assignment.dto';

import { UserRole } from 'src/app/user/user.interface';

import { CustomRequest } from 'src/utils/auth-utils';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { IdParam } from 'src/app/common/decorators/idParam.decorator';
import { QueryString } from 'src/app/database/dbquery';

@Controller('assignments')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createAssignment(
    @Body() dto: CreateAssignmentDTO,
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.assignmentService.createAssignment(dto, file, req);
  }

  @Patch(':id')
  async updateAssignment(
    @IdParam('id') assignmentId: string,
    @UploadedFile()
    files: { file: Express.Multer.File[] },
    @Body() dto: CreateAssignmentDTO,
    @Req() req: CustomRequest,
  ) {
    return this.assignmentService.updateAssignment(
      assignmentId,
      dto,
      files,
      req,
    );
  }

  @Patch(':id/delete')
  async deleteAssignment(
    @IdParam('id') assignmentId: string,
    @Req() req: CustomRequest,
  ) {
    return this.assignmentService.deleteAssignment(assignmentId, req);
  }

  @Get('course/:courseId')
  async getAssignmentsByCourse(
    @IdParam('courseId') courseId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.assignmentService.getAssignmentsByInstructor(
      courseId,
      query,
      req,
    );
  }

  @Get('instructor/:instructorId')
  async getAssignmentsByInstructor(
    @IdParam('instructorId') instructorId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.assignmentService.getAssignmentsByInstructor(
      instructorId,
      query,
      req,
    );
  }
}
