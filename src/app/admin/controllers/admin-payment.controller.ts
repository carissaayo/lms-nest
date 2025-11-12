import {
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Req,
} from '@nestjs/common';


import { CustomRequest } from 'src/utils/auth-utils';


import { UserRole } from '../../user/user.interface';


import { PermissionsEnum } from '../admin.interface';
import { AdminPaymentsService } from '../services/admin-payments.service';
import { QueryString } from 'src/app/database/dbquery';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { PermissionGuard, RequirePermissions } from 'src/security/guards/permissions.guard';

@Controller('admin-payments')
// @UsePipes(
//   new ValidationPipe({
//     whitelist: true,
//     transform: true,
//   }),
// )


@UseGuards(RoleGuard, PermissionGuard)
@RequireRoles(UserRole.ADMIN)
@RequirePermissions(PermissionsEnum.ADMIN_PAYMENTS)
export class AdminPaymentsController {
  constructor(private adminPaymentsService: AdminPaymentsService) {}

  @Get('')
  getPayments(@Query() query: QueryString, @Req() req: CustomRequest) {
    return this.adminPaymentsService.getPayments(query, req);
  }

  @Get('withdrawals')
  getWithdrawals(@Query() query: QueryString, @Req() req: CustomRequest) {
    return this.adminPaymentsService.getWithdrawals(query, req);
  }
}
