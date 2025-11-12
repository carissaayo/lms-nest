import {
  Controller,
  Get,
  UseGuards,
  Req,
  UseInterceptors,
  Patch,
  UploadedFile,
  Body,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';
import { UsersService } from './user.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from './user.dto';
import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';
import { UserRole } from './user.interface';

@Controller('users')
@UseGuards(RoleGuard)

@RequireRoles(UserRole.STUDENT)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getUserProfile(@Req() req: CustomRequest) {
    return this.usersService.viewProfile(req);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('picture'))
  async updateUser(
    @Body() updateProfile: UpdateUserDTO,
    @UploadedFile() picture: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.usersService.updateUser(updateProfile, picture, req);
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
