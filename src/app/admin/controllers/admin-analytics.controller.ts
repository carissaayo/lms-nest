import {
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Req,
} from '@nestjs/common';

import { RolesGuard } from '../../common/guards/role.guard';
import { CustomRequest } from 'src/utils/auth-utils';

import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.interface';
import {
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
} from 'src/app/common/guards/admin-auth.guard';

import { PermissionsGuard } from '../../common/guards/permissions.gurad';
import { Permissions } from '../../common/decorators/permissions.decorator';

import { PermissionsEnum } from '../admin.interface';
import { AdminPaymentsService } from '../services/admin-payments.service';
import { QueryString } from 'src/app/database/dbquery';
import { AdminAnalyticsService } from '../services/admin-analytics.service';

@Controller('admin-analytics')
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
export class AdminPaymentsController {
  constructor(private adminAnalyticsService: AdminAnalyticsService) {}

  @Get('')
  getAdminAnalytics(@Query() query: QueryString, @Req() req: CustomRequest) {
    return this.adminAnalyticsService.getAdminAnalytics(query, req);
  }
}
