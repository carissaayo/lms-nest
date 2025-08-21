import {
  Controller,
  Post,
  Body,
  Req,
  Patch,
  Delete,
  Param,
  Get,
  ParseIntPipe,
  UseGuards,
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

@Controller('lessons')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  async createLesson(@Body() dto: CreateLessonDTO, @Req() req: CustomRequest) {
    return this.lessonService.createLesson(dto, req);
  }

  @Patch(':id')
  async updateLesson(
    @Param('id', ParseIntPipe) lessonId: number,
    @Body() dto: UpdateLessonDTO,
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.updateLesson(lessonId, dto, req);
  }

  @Delete(':id')
  async deleteLesson(
    @Param('id', ParseIntPipe) lessonId: number,
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.deleteLesson(lessonId, req);
  }

  @Get('course/:courseId')
  async getLessons(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.getLessons(courseId, req);
  }

  // ✅ New bulk reorder endpoint
  @Patch('course/:courseId/reorder')
  async reorderLessons(
    @Param('courseId') courseId: string,
    @Body()
    body: { lessons: { lessonId: number; position: number }[] },
    @Req() req: CustomRequest,
  ) {
    return this.lessonService.reorderLessons(courseId, body.lessons, req);
  }
}
