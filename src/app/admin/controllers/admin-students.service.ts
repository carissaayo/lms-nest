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
import { AdminStudentsService } from '../services/admin-students.service';

@Controller('admin-students')
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
export class AdminStudentsController {
  constructor(private adminStudentsService: AdminStudentsService) {}

  @Get(':studentId')
  getSingleStudent(@Param() studentId: string) {
    return this.adminStudentsService.getSingleStudent(studentId);
  }

//   @Patch(':userid/action')
//   async getAllStudents(@Param() studentId: string) {
//     return this.adminStudentsService.updateStudentStatus(studentId);
//   }
}
