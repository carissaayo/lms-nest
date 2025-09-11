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
import { CourseService } from '../services/course.service';
import { UserRole } from 'src/app/user/user.interface';
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { CustomRequest } from 'src/utils/auth-utils';
import { CreateCourseDTO, UpdateCourseDTO } from '../course.dto';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { QueryString } from 'src/app/database/dbquery';
import { IdParam } from 'src/app/common/decorators/idParam.decorator';

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
}
