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
  Delete,
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

  @Get()
  async getCourses(@Query() query: any) {
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
}
