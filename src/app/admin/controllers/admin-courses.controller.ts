import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Patch,
  Param,
  Get,
  Query,
  Req,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.interface';

import { PermissionsGuard } from '../../common/guards/permissions.gurad';
import { Permissions } from '../../common/decorators/permissions.decorator';

import { PermissionsEnum } from '../admin.interface';
import { AdminCoursesService } from '../services/admin-course.service';
import { ApproveCourseDTO } from 'src/app/course/course.dto';
import { IdParam } from 'src/app/common/decorators/idParam.decorator';
import {
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
} from 'src/app/common/guards/admin-auth.guard';

@Controller('admin-courses')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
  PermissionsGuard,
)
@Roles(UserRole.ADMIN)
@Permissions(PermissionsEnum.ADMIN_COURSES)
export class AdminCoursesController {
  constructor(private adminCoursesService: AdminCoursesService) {}

  @Patch(':courseId/action')
  async approveCourse(
    @IdParam('courseId') courseId: string,
    @Body() dto: ApproveCourseDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminCoursesService.approveCourse(courseId, dto, req);
  }

  @Get()
  async getCourses(@Query() query: any) {
    return this.adminCoursesService.viewCourses(query);
  }
}
