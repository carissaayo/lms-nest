import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Patch,
  Param,
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
  constructor(private adminUserService: AdminUserService) {}

  @Patch(':courseId/action')
  approveCourse(
    @Param('courseId') courseId: string,
    @Body() suspendDto: SuspendUserDTO,
    req: CustomRequest,
  ) {
    return this.adminUserService.suspendUser(courseId, suspendDto, req);
  }
}
