import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Param,
  Put,
  Get,
  Body,
  Req,
} from '@nestjs/common';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { LectureService } from './lecture.service';
import { JwtAuthGuard } from '../domain/middleware/jwt.guard';
import { Roles } from '../domain/middleware/role.decorator';
import { Role } from '../domain/enums/roles.enum';
import { AuthenticatedRequest } from '../domain/middleware/role.guard';
import { CreateLectureDto } from './lecture.dto';

@Controller('lectures')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Post(':courseId/lecture')
  @Roles(Role.INSTRUCTOR)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'notes', maxCount: 1 },
    ]),
  )
  async createLecture(
    @Param('courseId') courseId: string,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      notes?: Express.Multer.File[];
    },
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateLectureDto,
  ) {
    return this.lectureService.createLecture(req, courseId, files, body);
  }

  @Put(':id/delete-lecture')
  @UseGuards(JwtAuthGuard)
  async deleteSingleLecture(@Param('id') id: string) {
    return this.lectureService.deleteSingleLecture(id);
  }

  @Put(':id/update-lecture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'notes', maxCount: 1 },
    ]),
  )
  async updateLecture(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      video?: Express.Multer.File[];
      notes?: Express.Multer.File[];
    },
    @Body() body: any,
    @Req() req: Request,
  ) {
    return this.lectureService.updateLecture(id, files, body);
  }

  @Get('course/lectures/:id')
  async getSingleLecture(@Param('id') id: string) {
    return this.lectureService.getSingleLecture(id);
  }
}
