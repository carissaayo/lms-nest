import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
  Get,
  Query,
  UseGuards,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  ChangePasswordDTO,
  LoginDto,
  RegisterDto,
  RequestResetPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from './auth.dto';
import { RolesGuard } from '../common/guards/role.guard';
import { CustomRequest } from 'src/utils/auth-utils';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from '../common/guards/user-auth.guard';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: CustomRequest) {
    return this.authService.login(loginDto, req);
  }

  @Post('verify-email')
  @UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard)
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDTO,
    @Req() req: CustomRequest,
  ) {
    return this.authService.verifyEmail(verifyEmailDto, req);
  }

  @Post('request-password-reset')
  @UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard)
  async passwordResetRequest(
    @Body() resetPasswordDto: RequestResetPasswordDTO,
  ) {
    return this.authService.requestResetPassword(resetPasswordDto);
  }

  @Post('password-reset')
  @UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDTO) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDTO,
    @Req() req: CustomRequest,
  ) {
    return this.authService.changePassword(changePasswordDto, req);
  }
  //   @Public()
  //   @Get('verify-email')
  //   async verifyEmail(@Query('token') token: string) {
  //     return await this.authService.verifyEmail(token);
  //   }

  //   @Post('resend-verification')
  //   async resendVerification(@Body('email') email: string) {
  //     try {
  //       return await this.authService.resendVerificationEmail(email);
  //     } catch (error) {
  //       throw new BadRequestException(error.message);
  //     }
  //   }

  //   @Put('change-password')
  //   async changePassword(
  //     @Req() req: AuthenticatedRequest,
  //     @Body() changePasswordDto: ChangePasswordDto,
  //   ) {
  //     return await this.authService.changePassword(req, changePasswordDto);
  //   }

  //   @Put('request-reset')
  //   async requestResetPasswordLink(
  //     @Req() req: AuthenticatedRequest,
  //     @Body() userEmail: string,
  //   ) {
  //     return await this.authService.requestResetPasswordLink(req, userEmail);
  //   }

  //   @Public()
  //   @Get('reset-password')
  //   async createNewPassword(@Query('token') token: string, @Res() res: Response) {
  //     return await this.authService.createNewPassword(res, token);
  //   }

  //   @Public()
  //   @Post('reset-password')
  //   async resetPassword(
  //     @Body()
  //     resetPasswordDto: ResetPasswordDto,
  //   ) {
  //     return await this.authService.resetPassword(resetPasswordDto);
  //   }
}
