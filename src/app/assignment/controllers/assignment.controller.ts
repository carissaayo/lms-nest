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
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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

@Controller('assignments')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}
  @Post(':courseId/:instructorId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 1 }]))
  async createAssignment(
    @UploadedFile()
    files: { file: Express.Multer.File[] },
    @Body() dto: CreateAssignmentDTO,
    @Req() req: CustomRequest,
  ) {
    return this.assignmentService.createAssignment(dto, files, req);
  }

  //   @Get('course/:courseId')
  //   async getAssignmentsByCourse(
  //     @Param('courseId', ParseIntPipe) courseId: number,
  //   ) {
  //     return this.assignmentService.getAssignmentsByCourse(courseId);
  //   }

  //   // 📌 Get all assignments by instructor
  //   @Get('instructor/:instructorId')
  //   async getAssignmentsByInstructor(
  //     @Param('instructorId') instructorId: string,
  //   ){
  //     return this.assignmentService.getAssignmentsByInstructor(instructorId);
  //   }

  //   // 📌 Update assignment
  //   @Patch(':id')
  //   @UseInterceptors(FileInterceptor('file'))
  //   async updateAssignment(
  //     @Param('id', ParseIntPipe) id: number,
  //     @UploadedFile() file: Express.Multer.File,
  //     @Body('title') title: string,
  //     @Body('description') description: string,
  //   ) {
  //     return this.assignmentService.updateAssignment(
  //       id,
  //       title,
  //       description,
  //       file,
  //     );
  //   }

  //   @Delete(':id')
  //   async deleteAssignment(
  //     @Param('id', ParseIntPipe) id: number,
  //   ): Promise<{ deleted: boolean }> {
  //     return this.assignmentService.deleteAssignment(id);
  //   }

  //   @Patch(':assignmentId/solutions/:solutionId/mark')
  //   async markSolution(
  //     @Param('assignmentId', ParseIntPipe) assignmentId: number,
  //     @Param('solutionId', ParseIntPipe) solutionId: number,
  //     @Body('grade') grade: number,
  //   ) {
  //     return this.assignmentService.markSolution(assignmentId, solutionId, grade);
  //   }
}
