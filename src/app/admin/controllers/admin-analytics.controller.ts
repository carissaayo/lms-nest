import {
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Req,
} from '@nestjs/common';

import { AdminAnalyticsService } from '../services/admin-analytics.service';

import { UserRole } from '../../user/user.interface';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';
import { CustomRequest } from 'src/utils/auth-utils';

import { QueryString } from 'src/app/database/dbquery';
import { PermissionsEnum } from '../admin.interface';

@Controller('admin-analytics')
@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_ANALYTICS)
export class AdminAnalyticsController {
  constructor(private adminAnalyticsService: AdminAnalyticsService) {}

  @Get('')
  getAdminAnalytics(@Query() query: QueryString, @Req() req: CustomRequest) {
    return this.adminAnalyticsService.getAdminAnalytics(query, req);
  }
}
