import { Controller, Post, Req, UseGuards, Body } from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { UserRole } from 'src/app/user/user.interface';

import { WithdrawalService } from '../services/withdrawal.service';
import { AddBankDto } from '../dtos/withdrawal.dto';

@Controller('withdrawals')
@UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  /**
   * Add a bank
   */
  @Post('banks')
  async addBank(@Body() dto: AddBankDto, @Req() req: CustomRequest) {
    return this.withdrawalService.addBank(dto, req);
  }
}
