import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  Req,
  Patch,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserRole } from 'src/app/user/user.interface';
import { CustomRequest } from 'src/utils/auth-utils';
import { CreateCourseDTO, UpdateCourseDTO } from '../course.dto';

import { QueryString } from 'src/app/database/dbquery';

import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { InstructorCourseService } from '../services/instructor-course.service';

@Controller('instructor-courses')
@UseGuards(RoleGuard)
@RequireRoles(UserRole.INSTRUCTOR)
export class InstructorCourseController {
  constructor(
    private readonly instructorCourseService: InstructorCourseService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  async createCourse(
    @Body() createCourseDto: CreateCourseDTO,
    @UploadedFile() coverImage: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.instructorCourseService.createCourse(
      createCourseDto,
      coverImage,
      req,
    );
  }

  @Get('')
  async getInstructorCourses(
    @Req() req: CustomRequest,
    @Query() query: QueryString,
  ) {
    return this.instructorCourseService.viewInstructorCourses(req, query);
  }

  

  @Delete(':id')
  async deleteCourse(@Param('id') courseId: string, @Req() req: CustomRequest) {
    return this.instructorCourseService.deleteCourse(courseId, req);
  }

  @Patch(':courseId')
  @UseInterceptors(FileInterceptor('coverImage'))
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDTO,
    @UploadedFile() coverImage: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.instructorCourseService.updateCourse(
      courseId,
      updateCourseDto,
      coverImage,
      req,
    );
  }

  @Patch(':id/submit')
  async submitCourse(@Param('id') courseId: string, @Req() req: CustomRequest) {
    return this.instructorCourseService.submitCourse(courseId, req);
  }

  @Patch(':id/publish')
  async publishCourse(
    @Param('id') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.instructorCourseService.publishCourse(courseId, req);
  }

  @Get(':id')
  async getSingleCourse(@Param('id') courseId: string) {
    return this.instructorCourseService.getSingleCourse(courseId);
  }
}
