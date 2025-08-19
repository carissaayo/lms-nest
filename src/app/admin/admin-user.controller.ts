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
} from '@nestjs/common';

import { RolesGuard } from '../common/guards/role.guard';
import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/user.entity';

import { PermissionsGuard } from '../common/guards/permissions.gurad';
import { Permissions } from '../common/decorators/permissions.decorator';
import { AdminUserService } from './admin-users.service';
import { SuspendUserDTO } from './admin.dto';

@Controller('admin-users')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(RolesGuard)
@UseGuards(PermissionsGuard)
@Roles(UserRole.ADMIN)
@Permissions('admin_user')
export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  @Patch(':userid/action')
  suspendUser(
    @Param('id') userId: string,
    @Body() suspendDto: SuspendUserDTO,
    req: CustomRequest,
  ) {
    return this.adminUserService.suspendUser(userId, suspendDto, req);
  }
}
