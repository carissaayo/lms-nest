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

import { UserRole } from '../../user/user.interface';

import { PermissionsEnum } from '../admin.interface';

import { AdminInstructorService } from '../services/admin-instructor.service';
import { UpdateInstructorStatusDTO } from '../admin.dto';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';

@Controller('admin-instructors')
@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_USERS)
export class AdminInstructorController {
  constructor(private adminInstructorService: AdminInstructorService) {}

  @Patch(':instructorId/action')
  updateInstructorStatus(
    @Param('instructorId') instructorId: string,
    @Body() dto: UpdateInstructorStatusDTO,
    @Req() req: CustomRequest,
  ) {
    return this.adminInstructorService.updateInstructorStatus(
      instructorId,
      dto,
      req,
    );
  }

  @Get('')
  viewInstructors(@Query() query: any, @Req() req: CustomRequest) {
    return this.adminInstructorService.viewInstructors(query, req);
  }


  @Get(':instructorId')
  getSingleInstructor(
    @Param('instructorId') instructorId: string,
    @Req() req: CustomRequest,
  ) {
    return this.adminInstructorService.getSingleInstructor(instructorId, req);
  }
}
