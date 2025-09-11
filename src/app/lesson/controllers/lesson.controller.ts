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
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { UserRole } from 'src/app/user/user.interface';

import { CustomRequest } from 'src/utils/auth-utils';
import { LessonService } from '../services/lesson.service';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { QueryString } from 'src/app/database/dbquery';

@Controller('lessons')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('create/')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'video', maxCount: 1 },
      { name: 'note', maxCount: 1 },
    ]),
  )
  async createLesson(
    @Body() dto: CreateLessonDTO,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; note?: Express.Multer.File[] },
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

  @Get('/:courseId')
  async getLessons(
    @Param('courseId') courseId: string,
    @Query() query: QueryString,
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.getLessons(courseId, query, req);
  }
  @Get('/')
  async getAllLessons(@Query() query: QueryString, @Req() req: CustomRequest) {
    return this.lessonService.getAllLessons(query, req);
  }
  //   // ✅ New bulk reorder endpoint
  //   @Patch('course/:courseId/reorder')
  //   async reorderLessons(
  //     @Param('courseId') courseId: string,
  //     @Body()
  //     body: { lessons: { lessonId: number; position: number }[] },
  //     @Req() req: CustomRequest,
  //   ) {
  //     return this.lessonService.reorderLessons(courseId, body.lessons, req);
  //   }
}
