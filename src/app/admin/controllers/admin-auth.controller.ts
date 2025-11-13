import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ChangePasswordDTO,
  LoginDto,
  RegisterDto,
  RequestResetPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from '../../auth/auth.dto';
import { RolesGuard } from '../../common/guards/role.guard';
import { CustomRequest } from 'src/utils/auth-utils';


import { Roles } from '../../common/decorators/roles.decorator';

import { AdminAuthService } from '../services/admin-auth.service';
import { UserRole } from 'src/app/user/user.interface';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';

@Controller('admin-auth')

@UseGuards(RoleGuard)
export class AdminAuthController {
  constructor(private authService: AdminAuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: CustomRequest) {
    return this.authService.login(loginDto, req);
  }

  @Post('verify-email')
  @RequireRoles(UserRole.ADMIN)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDTO,
    @Req() req: CustomRequest,
  ) {
    return this.authService.verifyEmail(verifyEmailDto, req);
  }

  @Post('request-password-reset')
  async passwordResetRequest(
    @Body() resetPasswordDto: RequestResetPasswordDTO,
  ) {
    return this.authService.requestResetPassword(resetPasswordDto);
  }

  @Post('password-reset')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @RequireRoles(UserRole.ADMIN)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDTO,
    @Req() req: CustomRequest,
  ) {
    return this.authService.changePassword(changePasswordDto, req);
  }
}
