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

import { Public } from '../domain/middleware/public.decorator';
// import { TermiiService } from '../domain/services/termii.service';
import {
  AuthenticatedRequest,
  RolesGuard,
} from '../domain/middleware/role.guard';
import { Role } from '../domain/enums/roles.enum';
import { Roles } from '../domain/middleware/role.decorator';
import { Request, Response } from 'express';
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './auth.dto';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
@UseGuards(RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // private readonly termiiService: TermiiService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body()
    body: RegisterDto,
  ) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    if (!token) throw new UnauthorizedException('Invalid credentials');
    return token;
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    try {
      return await this.authService.resendVerificationEmail(email);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('change-password')
  async changePassword(
    @Req() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(req, changePasswordDto);
  }

  @Put('request-reset')
  async requestResetPasswordLink(
    @Req() req: AuthenticatedRequest,
    @Body() userEmail: string,
  ) {
    return await this.authService.requestResetPasswordLink(req, userEmail);
  }

  @Public()
  @Get('reset-password')
  async createNewPassword(@Query('token') token: string, @Res() res: Response) {
    return await this.authService.createNewPassword(res, token);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body()
    resetPasswordDto: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(resetPasswordDto);
  }
}
