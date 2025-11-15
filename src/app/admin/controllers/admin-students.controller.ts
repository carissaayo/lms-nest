import {
  Controller,
  UseGuards,
  Param,
  Get,
  Req,
  Body,
  Patch,
  Query,
} from '@nestjs/common';

import { UserRole } from '../../user/user.interface';


import { PermissionsEnum } from '../admin.interface';

import { AdminStudentsService } from '../services/admin-students.service';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';
import { CustomRequest } from 'src/utils/admin-auth-utils';
import { UpdateStudentStatusDTO } from '../admin.dto';

@Controller('admin-students')
@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_USERS)
export class AdminStudentsController {
  constructor(private adminStudentsService: AdminStudentsService) {}

  @Get(':studentId')
  getSingleStudent(
    @Param('studentId') studentId: string,
    @Req() req: CustomRequest,
  ) {
    return this.adminStudentsService.getSingleStudent(studentId, req);
  }
  @Patch(':studentId/action')
  updateStudentStatus(
    @Param('studentId') studentId: string,
    @Body() dto: UpdateStudentStatusDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminStudentsService.updateStudentStatus(studentId, dto, req);
  }

  @Get('students')
  async getAllStudents(@Query() query: any, @Req() req: CustomRequest) {
    return this.adminStudentsService.viewStudents(query, req);
  }
}
