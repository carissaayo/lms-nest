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
  Request,
} from '@nestjs/common';
import { CourseService } from './course.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LectureService } from '../lecture/lecture.service';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
import {
  AuthenticatedRequest,
  RolesGuard,
} from '../domain/middleware/role.guard';
import { JwtAuthGuard } from '../domain/middleware/jwt.guard';
import { Roles } from '../domain/middleware/role.decorator';
import { Role } from '../domain/enums/roles.enum';
import { Public } from '../domain/middleware/public.decorator';

@Controller('courses')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly lectureService: LectureService,
  ) {}

  // Public routes
  @Public()
  @Get('filter')
  filterCourses(@Query() query: any) {
    return this.courseService.filterCourses(query);
  }
  @Public()
  @Get(':id')
  getSingleCourse(@Param('id') id: string) {
    return this.courseService.getSingleCourse(id);
  }

  @Get('instructor/:instructor')
  getAllCoursesByAnInstructor(@Param('instructor') instructor: string) {
    return this.courseService.getAllCoursesByAnInstructor(instructor);
  }

  @Get('course/:id')
  getAllLecturesInACourse(@Param('id') id: string) {
    return this.lectureService.getAllLecturesInACourse(id);
  }

  // Instructors
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(FileInterceptor('image', { storage: diskStorage({}) }))
  createCourse(
    @Request() req: AuthenticatedRequest,
    @Body() body: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.courseService.createCourse(req, body, file);
  }

  @Roles(Role.INSTRUCTOR)
  @Put(':id/update-course')
  updateCourse(
    @Param('id') id: string,
    @Body() body: UpdateCourseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.courseService.updateCourse(req, body, id);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.INSTRUCTOR)
  @Post(':id/submission')
  submitCourseForApproval(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.courseService.submitCourseForApproval(req, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/delete-course')
  deleteCourse(@Param('id') id: string, @Request() req) {
    return this.courseService.deleteCourse(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('instructor/:instructor')
  deleteCoursesByAnInstructor(
    @Param('instructor') instructor: string,
    @Request() req,
  ) {
    return this.courseService.deleteCoursesByAnInstructor(instructor, req.user);
  }

  @Roles(Role.INSTRUCTOR)
  @Put('publish-course/:id')
  publishCourseByInstructor(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.courseService.publishCourse(req, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/lectures')
  deleteAllLectureInACourse(@Param('id') id: string, @Request() req) {
    return this.lectureService.deleteAllLectureInACourse(id, req.user);
  }

  // Admin/Moderator
  @Roles(Role.MODERATOR)
  @Put('approve-course/:id')
  approveCourseByModerator(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.courseService.approveCourse(req, id);
  }

  @Roles(Role.ADMIN)
  @Get()
  getAllCoursesAvailable(@Request() req: AuthenticatedRequest) {
    return this.courseService.getAllCourses(req);
  }
}
