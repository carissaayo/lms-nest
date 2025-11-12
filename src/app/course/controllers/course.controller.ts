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
import { CourseService } from '../services/course.service';
import { UserRole } from 'src/app/user/user.interface';
import { CustomRequest } from 'src/utils/auth-utils';
import { CreateCourseDTO, UpdateCourseDTO } from '../course.dto';

import { QueryString } from 'src/app/database/dbquery';

import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';

@Controller('courses')

@UseGuards(RoleGuard)
@RequireRoles(UserRole.INSTRUCTOR)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  async createCourse(
    @Body() createCourseDto: CreateCourseDTO,
    @UploadedFile() coverImage: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.courseService.createCourse(createCourseDto, coverImage, req);
  }

  @Patch(':courseId')
  @UseInterceptors(FileInterceptor('coverImage'))
  async updateCourse(
    @Param('courseId') courseId: string,
    @Body() updateCourseDto: UpdateCourseDTO,
    @UploadedFile() coverImage: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.courseService.updateCourse(
      courseId,
      updateCourseDto,
      coverImage,
      req,
    );
  }

  @Get()
  async getCourses(@Query() query: QueryString) {
    return this.courseService.viewCourses(query);
  }

  @Delete(':id')
  async deleteCourse(@Param('id') courseId: string, @Req() req: CustomRequest) {
    return this.courseService.deleteCourse(courseId, req);
  }

  @Patch(':id/submit')
  async submitCourse(@Param('id') courseId: string, @Req() req: CustomRequest) {
    return this.courseService.submitCourse(courseId, req);
  }
  @Patch(':id/publish')
  async publishCourse(
    @Param('id') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.courseService.publishCourse(courseId, req);
  }
  @Get(':id')
  async getSingleCourse(@Param('id') courseId: string) {
    return this.courseService.getSingleCourse(courseId);
  }

  @Get(':id/view')
  async viewCourse(@Param('id') courseId: string, @Req() req: CustomRequest) {
    return this.courseService.viewCourseForInstructor(courseId, req);
  }
  @Get('instructor')
  async getInstructorCourses(
    @Req() req: CustomRequest,
    @Query() query: QueryString,
  ) {
    return this.courseService.viewInstructorCourses(req, query);
  }
}
