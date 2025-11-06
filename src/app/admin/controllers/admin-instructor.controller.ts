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

import { PermissionsEnum } from '../admin.interface';
import {
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
} from 'src/app/common/guards/admin-auth.guard';
import { AdminInstructorService } from '../services/admin-instructor.service';
import { UpdateInstructorStatusDTO } from '../admin.dto';

@Controller('admin-instructors')
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

  @Get('instructors')
  viewInstructors(@Query() query: any) {
    return this.adminInstructorService.viewInstructors(query);
  }

  @Get('instructorId')
  getSingleInstructor(@Param('instructorId') instructorId: string) {
    return this.adminInstructorService.getSingleInstructor(instructorId);
  }
}
