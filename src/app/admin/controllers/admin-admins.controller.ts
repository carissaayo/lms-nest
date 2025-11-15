import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
  Patch,
  Param,
  Get,
} from '@nestjs/common';

import { RolesGuard } from '../../common/guards/role.guard';
import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.interface';

import { PermissionsGuard } from '../../common/guards/permissions.gurad';
import { Permissions } from '../../common/decorators/permissions.decorator';

import {
  AddAnAdminDTO,
  AssignPermissionsDTO,
  SuspendUserDTO,
} from '../admin.dto';
import { AdminAdminsService } from '../services/admin-admins.service';
import { PermissionsEnum } from '../admin.interface';

import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';

@Controller('admin-admins')

@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
export class AdminAdminsController {
  constructor(private adminAdminService: AdminAdminsService) {}

  @Get('profile')
  async viewProfile(@Req() req: CustomRequest) {
    return this.adminAdminService.viewProfile(req);
  }

  @Post('add-admin')
  @RequirePermissions(PermissionsEnum.ADMIN_ADMINS)
  async addAdminByEmail(@Body() dto: AddAnAdminDTO, @Req() req: CustomRequest) {
    return this.adminAdminService.addAdminByEmail(dto, req);
  }
  @Patch(':userId/action')
  @RequirePermissions(PermissionsEnum.ADMIN_ADMINS)
  async suspendUser(
    @Param('userId') userId: string,
    @Body() suspendDto: SuspendUserDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminAdminService.suspendAdmin(userId, suspendDto, req);
  }

  @RequirePermissions(PermissionsEnum.ADMIN_PERMISSIONS)
  @Patch(':userId/permissions')
  async assignPermission(
    @Param('userId') userId: string,
    @Body() dto: AssignPermissionsDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminAdminService.assignPermission(userId, dto, req);
  }
}
