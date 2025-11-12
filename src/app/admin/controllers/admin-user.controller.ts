import {
  Controller,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Get,
  Query,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import { UserRole } from '../../user/user.interface';

import { AdminUserService } from '../services/admin-users.service';
import { SuspendUserDTO } from '../admin.dto';
import { PermissionsEnum } from '../admin.interface';

import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';

@Controller('admin-users')
@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_USERS)
export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  @Get('instructors')
  viewInstructors(@Query() query: any, @Req() req: CustomRequest) {
    return this.adminUserService.viewInstructors(query, req);
  }

  @Get('students')
  async getAllStudents(@Query() query: any, @Req() req: CustomRequest) {
    return this.adminUserService.viewStudents(query, req);
  }

  @Patch(':userid/action')
  suspendUser(
    @Param('id') userId: string,
    @Body() suspendDto: SuspendUserDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminUserService.suspendUser(userId, suspendDto, req);
  }
}
