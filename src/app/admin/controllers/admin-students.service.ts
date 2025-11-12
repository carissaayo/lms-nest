import {
  Controller,
  UseGuards,
  Param,
  Get,
} from '@nestjs/common';

import { UserRole } from '../../user/user.interface';


import { PermissionsEnum } from '../admin.interface';

import { AdminStudentsService } from '../services/admin-students.service';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';

@Controller('admin-students')
@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_USERS)
export class AdminStudentsController {
  constructor(private adminStudentsService: AdminStudentsService) {}

  @Get(':studentId')
  getSingleStudent(@Param('studentId') studentId: string) {
    return this.adminStudentsService.getSingleStudent(studentId);
  }

  //   @Patch(':userid/action')
  //   async getAllStudents(@Param() studentId: string) {
  //     return this.adminStudentsService.updateStudentStatus(studentId);
  //   }
}
