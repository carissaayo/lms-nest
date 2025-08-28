import {
  Controller,
  Post,
  Req,
  UseGuards,
  Body,
  Get,
  Patch,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from 'src/app/common/guards/user-auth.guard';
import { RolesGuard } from 'src/app/common/guards/role.guard';
import { Roles } from 'src/app/common/decorators/roles.decorator';
import { UserRole } from 'src/app/user/user.interface';

import { WithdrawalService } from '../services/withdrawal.service';
import {
  AddBankDto,
  ConfirmWithdrawDto,
  WithdrawDto,
} from '../dtos/withdrawal.dto';
import { IdParam } from 'src/app/common/decorators/idParam.decorator';

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

  //   Delete a bank
  @Patch('banks/:bankId')
  async deleteBank(
    @IdParam('bankId') bankId: string,
    @Req() req: CustomRequest,
  ) {
    return this.withdrawalService.deleteBank(req, bankId);
  }

  @Get('nigerian-banks')
  async getSupportedBanks() {
    return this.withdrawalService.getSupportedBanks();
  }

  @Post('initiate')
  async requestWithdrawCode(
    @Body() dto: WithdrawDto,
    @Req() req: CustomRequest,
  ) {
    return this.withdrawalService.requestWithdrawCode(req, dto);
  }

  @Patch(':withdrawalId')
  async confirmWithdrawalCode(
    @IdParam('withdrawalId') withdrawalId: string,
    @Body() dto: ConfirmWithdrawDto,
    @Req() req: CustomRequest,
  ) {
    return this.withdrawalService.confirmWithdrawalCode(req, dto, withdrawalId);
  }
}
