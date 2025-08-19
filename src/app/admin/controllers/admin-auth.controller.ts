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

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';
import { AdminAuthService } from '../services/admin-auth.service';
import {
  AuthenticateTokenAdminGuard,
  ReIssueTokenAdminGuard,
} from '../../common/guards/admin-auth.guard';

@Controller('admin-auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuthController {
  constructor(private authService: AdminAuthService) {}

  @Post('register')
  @Public()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Req() req: CustomRequest) {
    return this.authService.login(loginDto, req);
  }

  @Post('verify-email')
  @UseGuards(AuthenticateTokenAdminGuard, ReIssueTokenAdminGuard)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDTO,
    @Req() req: CustomRequest,
  ) {
    return this.authService.verifyEmail(verifyEmailDto, req);
  }

  @Post('request-password-reset')
  @UseGuards(AuthenticateTokenAdminGuard, ReIssueTokenAdminGuard)
  async passwordResetRequest(
    @Body() resetPasswordDto: RequestResetPasswordDTO,
  ) {
    return this.authService.requestResetPassword(resetPasswordDto);
  }

  @Post('password-reset')
  @UseGuards(AuthenticateTokenAdminGuard, ReIssueTokenAdminGuard)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(AuthenticateTokenAdminGuard, ReIssueTokenAdminGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDTO,
    @Req() req: CustomRequest,
  ) {
    return this.authService.changePassword(changePasswordDto, req);
  }
}
