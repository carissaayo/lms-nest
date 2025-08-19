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
} from '@nestjs/common';

import { RolesGuard } from '../../common/guards/role.guard';
import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';

import { PermissionsGuard } from '../../common/guards/permissions.gurad';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AdminUserService } from '../services/admin-users.service';
import { SuspendUserDTO } from '../admin.dto';
import { PermissionsEnum } from '../admin.interface';
import { AdminCoursesService } from '../services/admin-course.service';
import { ApproveCourseDTO } from 'src/app/course/course.dto';

@Controller('admin-courses')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(RolesGuard)
@UseGuards(PermissionsGuard)
@Roles(UserRole.ADMIN)
@Permissions(PermissionsEnum.ADMIN_COURSES)
export class AdminCoursesController {
  constructor(private adminCoursesService: AdminCoursesService) {}

  @Patch(':courseId/action')
  async approveCourse(
    @Param('courseId') courseId: string,
    @Body() dto: ApproveCourseDTO,
    req: CustomRequest,
  ) {
    return this.adminCoursesService.approveCourse(courseId, dto, req);
  }

  @Get()
  async getCourses(@Query() query: any) {
    return this.adminCoursesService.viewCourses(query);
  }
}
