import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomRequest } from 'src/utils/auth-utils';
import { UsersService } from './user.service';
import {
  AuthenticateTokenUserGuard,
  ReIssueTokenUserGuard,
} from '../common/guards/user-auth.guard';

@Controller('users')
@UseGuards()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthenticateTokenUserGuard, ReIssueTokenUserGuard)
  async getUserProfile(@Req() req: CustomRequest) {
    return this.usersService.viewProfile(req);
  }

  //   @Get(':id')
  //   async getUserByAdmin(
  //     @Req() req: AuthenticatedRequest,
  //     @Param('id') userId: string,
  //   ) {
  //     return this.usersService.getSingleUserByAdmin(req, userId);
  //   }

  //   @Patch('user/update')
  //   async resetPassword(
  //     @Req() req: AuthenticatedRequest,
  //     @Body()
  //     body: UpdateUserDto,
  //     @Param('id') userId: string,
  //   ) {
  //     return await this.usersService.updateUserProfile(req, userId, body);
  //   }

  //   @Patch('user/delete')
  //   async deleteUser(
  //     @Req() req: AuthenticatedRequest,
  //     @Param('id') userId: string,
  //   ) {
  //     return await this.usersService.deleteUser(req, userId);
  //   }

  //   @Patch('user/make-admin')
  //   async makeUserAdmin(
  //     @Req() req: AuthenticatedRequest,
  //     @Param('id') userId: string,
  //   ) {
  //     return await this.usersService.makeUserAdmin(req, userId);
  //   }
}
