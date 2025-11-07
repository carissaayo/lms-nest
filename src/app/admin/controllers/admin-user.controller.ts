import {
  Controller,
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

import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.interface';

import { PermissionsGuard } from '../../common/guards/permissions.gurad';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { AdminUserService } from '../services/admin-users.service';
import { SuspendUserDTO } from '../admin.dto';
import { PermissionsEnum } from '../admin.interface';
import {
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
} from 'src/app/common/guards/admin-auth.guard';

@Controller('admin-users')
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
@Permissions(PermissionsEnum.ADMIN_USERS)
export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  @Get('instructors')
  viewInstructors(
    @Query() query: any,
   @Req() req: CustomRequest) {
    return this.adminUserService.viewInstructors(query, req);
  }

  @Get('students')
  async getAllStudents(@Query() query: any, req: CustomRequest) {
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
