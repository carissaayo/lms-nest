import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AssignmentService } from './assignment.service';
import { StudentService } from '../student/student.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // your version of verifyToken
import { diskStorage } from 'multer';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentController {
  constructor(
    private readonly assignmentService: AssignmentService,
    private readonly studentService: StudentService,
  ) {}

  @Post(':lectureId/create-assignment')
  @UseInterceptors(FileInterceptor('question'))
  async createAssignment(
    @Param('lectureId') lectureId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: any,
  ) {
    return this.assignmentService.createAssignment(
      req.user,
      lectureId,
      body,
      file,
    );
  }

  @Post(':assignmentId/submit-assignment')
  @UseInterceptors(FileInterceptor('answer'))
  async submitAssignment(
    @Param('assignmentId') assignmentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: any,
  ) {
    return this.studentService.submitAssignment(
      req.user,
      assignmentId,
      body,
      file,
    );
  }

  @Get(':assignmentId')
  async getSingleAssignment(@Param('assignmentId') assignmentId: string) {
    return this.assignmentService.getSingleAssignment(assignmentId);
  }

  @Get('instructor/:instructorId')
  async getAssignmentsByInstructor(
    @Param('instructorId') instructorId: string,
    @Req() req: Request,
  ) {
    return this.assignmentService.getAssignmentsByAnInstructor(
      req.user,
      instructorId,
    );
  }

  @Put(':id/delete-assignment')
  async deleteSingleAssignment(@Param('id') id: string, @Req() req: Request) {
    return this.assignmentService.deleteSingleAssignment(req.user, id);
  }

  @Put(':instructorId/delete-assignments')
  async deleteAssignmentsByInstructor(
    @Param('instructorId') instructorId: string,
    @Req() req: Request,
  ) {
    return this.assignmentService.deleteAssignmentByAnInstructor(
      req.user,
      instructorId,
    );
  }

  @Get()
  async getAllAssignments(@Req() req: Request) {
    return this.assignmentService.getAllAssignments(req.user);
  }

  @Put(':assignmentId/update-assignment')
  async updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return this.assignmentService.updateAssignment(
      req.user,
      assignmentId,
      body,
    );
  }
}
