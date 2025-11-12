import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Patch,
  Get,
  Query,
  Req,
  Param,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.interface';

import { PermissionsGuard } from '../../common/guards/permissions.gurad';
import { Permissions } from '../../common/decorators/permissions.decorator';

import { PermissionsEnum } from '../admin.interface';
import { AdminCoursesService } from '../services/admin-course.service';
import { AdminCourseActionDTO } from 'src/app/course/course.dto';
import { IdParam } from 'src/app/common/decorators/idParam.decorator';
import {
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
} from 'src/app/common/guards/admin-auth.guard';
import { QueryString } from 'src/app/database/dbquery';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';

@Controller('admin-courses')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_COURSES)
export class AdminCoursesController {
  constructor(private adminCoursesService: AdminCoursesService) {}

  @Patch(':courseId/action')
  async approveCourse(
    @Param('courseId') courseId: string,
    @Body() dto: AdminCourseActionDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminCoursesService.approveCourse(courseId, dto, req);
  }

  @Get()
  async getCourses(@Query() query: QueryString) {
    return this.adminCoursesService.viewCourses(query);
  }

  @Get(':courseId')
  async getSingleCourse(
    @Param('courseId') courseId: string,
    @Req() req: CustomRequest,
  ) {
    return this.adminCoursesService.getSingleCourse(courseId, req);
  }
}
