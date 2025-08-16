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
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CourseService } from './course.service';
import { UserRole } from '../user/user.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { CustomRequest } from 'src/utils/auth-utils';
import { CreateCourseDTO, UpdateCourseDTO } from './course.dto';
import { RolesGuard } from '../common/guards/role.guard';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from '../common/guards/user-auth.guard';

@Controller('courses')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
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
    @Param('courseId', ParseUUIDPipe) courseId: string,
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
  //   // Public routes
  //   @Public()
  //   @Get('filter')
  //   filterCourses(@Query() query: any) {
  //     return this.courseService.filterCourses(query);
  //   }
  //   @Public()
  //   @Get(':id')
  //   getSingleCourse(@Param('id') id: string) {
  //     return this.courseService.getSingleCourse(id);
  //   }

  //   @Get('instructor/:instructor')
  //   getAllCoursesByAnInstructor(@Param('instructor') instructor: string) {
  //     return this.courseService.getAllCoursesByAnInstructor(instructor);
  //   }

  //   @Get('course/:id')
  //   getAllLecturesInACourse(@Param('id') id: string) {
  //     return this.lectureService.getAllLecturesInACourse(id);
  //   }

  //   @Roles(Role.INSTRUCTOR)
  //   @Post('create')
  //   @UseInterceptors(FileInterceptor('image', { storage: diskStorage({}) }))
  //   createCourse(
  //     @Request() req: AuthenticatedRequest,
  //     @Body() body: CreateCourseDto,
  //     @UploadedFile() file: Express.Multer.File,
  //   ) {
  //     return this.courseService.createCourse(req, body, file);
  //   }

  //   @Roles(Role.INSTRUCTOR)
  //   @Put(':id/update-course')
  //   updateCourse(
  //     @Param('id') id: string,
  //     @Body() body: UpdateCourseDto,
  //     @Request() req: AuthenticatedRequest,
  //   ) {
  //     return this.courseService.updateCourse(req, body, id);
  //   }

  //   @Roles(Role.INSTRUCTOR)
  //   @Post(':id/submission')
  //   submitCourseForApproval(
  //     @Param('id') id: string,
  //     @Request() req: AuthenticatedRequest,
  //   ) {
  //     return this.courseService.submitCourseForApproval(req, id);
  //   }

  //   @Roles(Role.INSTRUCTOR)
  //   @Put(':id/delete-course')
  //   deleteCourse(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
  //     return this.courseService.deleteCourse(req, id);
  //   }

  //   @Roles(Role.INSTRUCTOR)
  //   @Put('publish-course/:id')
  //   publishCourseByInstructor(
  //     @Param('id') id: string,
  //     @Request() req: AuthenticatedRequest,
  //   ) {
  //     return this.courseService.publishCourse(req, id);
  //   }

  //   @Roles(Role.INSTRUCTOR)
  //   @Put(':id/lectures')
  //   deleteAllLectureInACourse(
  //     @Param('id') id: string,
  //     @Request() req: AuthenticatedRequest,
  //   ) {
  //     return this.lectureService.deleteAllLectureInACourse(req, id);
  //   }

  //   // Admin/Moderator
  //   @Roles(Role.MODERATOR)
  //   @Put('approve-course/:id')
  //   approveCourseByModerator(
  //     @Param('id') id: string,
  //     @Request() req: AuthenticatedRequest,
  //   ) {
  //     return this.courseService.approveCourse(req, id);
  //   }

  //   @Roles(Role.ADMIN)
  //   @Get()
  //   getAllCoursesAvailable(@Request() req: AuthenticatedRequest) {
  //     return this.courseService.getAllCourses();
  //   }
}
