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
  Query,
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
@RequirePermissions(PermissionsEnum.ADMIN_ADMINS)
export class AdminAdminsController {
  constructor(private adminAdminService: AdminAdminsService) {}

  @Get(':adminId')
  async getSingleAdmin(@Param('adminId') adminId: string, @Req() req: CustomRequest) {
    return this.adminAdminService.getSingleAdmin(adminId, req);
  }

  @Get('')
  async getAdmins(@Query() query: any, @Req() req: CustomRequest) {
    return this.adminAdminService.getAdmins(query, req);
  }

  @Post('add-admin')
  
  async addAdminByEmail(@Body() dto: AddAnAdminDTO, @Req() req: CustomRequest) {
    return this.adminAdminService.addAdminByEmail(dto, req);
  }
  @Patch(':userId/action')
  
  async suspendUser(
    @Param('userId') userId: string,
    @Body() suspendDto: SuspendUserDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminAdminService.suspendAdmin(userId, suspendDto, req);
  }

  
  @Patch(':userId/permissions')
  async assignPermission(
    @Param('userId') userId: string,
    @Body() dto: AssignPermissionsDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminAdminService.assignPermission(userId, dto, req);
  }
}
