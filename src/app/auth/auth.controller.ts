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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../domain/dto/auth.dto';

import { Public } from '../domain/middleware/public.decorator';
// import { TermiiService } from '../domain/services/termii.service';
import { RolesGuard } from '../domain/middleware/role.guard';
import { Role } from '../domain/enums/roles.enum';
import { Roles } from '../domain/middleware/role.decorator';
import { Request } from 'express';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // private readonly termiiService: TermiiService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      confirmPassword: string;
      phone: string;
      name: string;
    },
  ) {
    return this.authService.register(
      body.email,
      body.password,
      body.confirmPassword,
      body.phone,
      body.name,
    );
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

  @Post('logout')
  async logout(@Req() req: Request) {
    return await this.authService.logout(req);
  }

  @Put('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return await this.authService.changePassword(
      req.user,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Put('request-reset')
  async requestResetPasswordLink(@Req() req: Request) {
    return await this.authService.requestResetPasswordLink(req.user.email);
  }

  @Public()
  @Get('reset-password')
  async createNewPassword(@Query('token') token: string) {
    return await this.authService.createNewPassword(token);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body()
    body: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    return await this.authService.resetPassword(
      body.token,
      body.newPassword,
      body.confirmPassword,
    );
  }
}
