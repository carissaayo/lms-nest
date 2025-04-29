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
import { LectureService } from '../lecture/lecture.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('courses')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly lectureService: LectureService,
  ) {}

  // Public routes
  @Get('filter')
  filterCourses(@Query() query: any) {
    return this.courseService.filterCourses(query);
  }

  @Get(':id')
  getSingleCourse(@Param('id') id: string) {
    return this.courseService.getSingleCourse(id);
  }

  @Get('instructor/:instructor')
  getAllCoursesByAnInstructor(@Param('instructor') instructor: string) {
    return this.courseService.getAllCoursesByAnInstructor(instructor);
  }

  // Students
  @UseGuards(JwtAuthGuard)
  @Get('course/:id')
  getAllLecturesInACourse(@Param('id') id: string) {
    return this.lectureService.getAllLecturesInACourse(id);
  }

  // Instructors
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(FileInterceptor('image', { storage: diskStorage({}) }))
  createCourse(
    @UploadedFile() file: Express.Multer.File,
    @Body() body,
    @Request() req,
  ) {
    return this.courseService.createCourse(req.user, file, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/update-course')
  updateCourse(@Param('id') id: string, @Body() body, @Request() req) {
    return this.courseService.updateCourse(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/submission')
  submitCourseForApproval(@Param('id') id: string, @Request() req) {
    return this.courseService.submitCourseForApproval(id, req.user);
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

  @UseGuards(JwtAuthGuard)
  @Put('publish-course/:id')
  publishCourseByInstructor(@Param('id') id: string, @Request() req) {
    return this.courseService.publishCourseByInstructor(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/lectures')
  deleteAllLectureInACourse(@Param('id') id: string, @Request() req) {
    return this.lectureService.deleteAllLectureInACourse(id, req.user);
  }

  // Admin/Moderator
  @UseGuards(JwtAuthGuard)
  @Put('approve-course/:id')
  approveCourseByModerator(@Param('id') id: string, @Request() req) {
    return this.courseService.approveCourseByModerator(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllCoursesAvailable(@Request() req) {
    return this.courseService.getAllCoursesAvailable(req.user);
  }
}
