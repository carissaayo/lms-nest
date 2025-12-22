import {
  Controller,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { CustomRequest } from 'src/utils/auth-utils';

import { UserRole } from '../../user/user.interface';

import { AdminUserService } from '../services/admin-users.service';

import { RequireRoles, RoleGuard } from 'src/security/guards/role.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from 'src/app/user/user.dto';

@Controller('admin-users')
@UseGuards(RoleGuard)
@RequireRoles(UserRole.ADMIN)
export class AdminUserController {
  constructor(private adminUserService: AdminUserService) {}

  @Get('profile')
  async getUserProfile(@Req() req: CustomRequest) {
    return this.adminUserService.viewProfile(req);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('picture'))
  async updateUser(
    @Body() updateProfile: UpdateUserDTO,
    @UploadedFile() picture: Express.Multer.File,
    @Req() req: CustomRequest,
  ) {
    return this.adminUserService.updateUser(updateProfile, picture, req);
  }
  @Get('')
  viewUsers(@Query() query: any, @Req() req: CustomRequest) {
    return this.adminUserService.viewUsers(query, req);
  }

  @Get('/:id')
  viewSingleUser(@Param("id") id: string, @Req() req: CustomRequest) {
    return this.adminUserService.getSingleUser(id, req);
  }
}
