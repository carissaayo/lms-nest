import {
  Controller,
  Post,
  Body,
  Req,
  Patch,
  Delete,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
  Param,
} from '@nestjs/common';

import { UserRole } from 'src/app/user/user.interface';

import { CustomRequest } from 'src/utils/auth-utils';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { QueryString } from 'src/app/database/dbquery';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';

@Controller('lessons')
@UseGuards(RoleGuard)
@RequireRoles(UserRole.INSTRUCTOR)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'note', maxCount: 1 },
    ]),
  )
  async createLesson(
    @Body() dto: CreateLessonDTO,
    @UploadedFiles()
    files: { video: Express.Multer.File[]; note?: Express.Multer.File[] },
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.createLesson(dto, files, req);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'note', maxCount: 1 },
    ]),
  )
  async updateLesson(
    @Param('id') lessonId: string,
    @Body() dto: UpdateLessonDTO,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; note?: Express.Multer.File[] },
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.updateLesson(dto, files, req, lessonId);
  }

  @Delete(':id/delete')
  async deleteLesson(@Param('id') lessonId: string, @Req() req: CustomRequest) {
    return this.lessonService.deleteLesson(lessonId, req);
  }

  @Get('/course/:courseId')
  async getLessons(
    @Param('courseId') courseId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.getLessons(courseId, query, req);
  }

  @Get('/course/:courseId/all')
  async getLessonsStudent(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.getLessonsStudent(courseId, req);
  }
  @Get('/')
  async getAllLessons(@Query() query: QueryString, @Req() req: CustomRequest) {
    return this.lessonService.getAllLessons(query, req);
  }
}
