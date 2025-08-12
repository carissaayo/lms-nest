// import {
//   Controller,
//   Get,
//   Param,
//   Body,
//   Patch,
//   UseGuards,
//   Req,
// } from '@nestjs/common';

// import {
//   AuthenticatedRequest,
//   RolesGuard,
// } from '../domain/middleware/role.guard';
// import { Roles } from '../domain/middleware/role.decorator';
// import { Role } from '../domain/enums/roles.enum';
// import { UsersService } from 'src/app/user/user.service';
// import { UpdateUserDto } from './user.dto';

// @Controller('users')
// @UseGuards(RolesGuard)
// export class UsersController {
//   constructor(private readonly usersService: UsersService) {}

//   @Patch(':id/role')
//   @Roles(Role.ADMIN)
//   async changeUserRole(
//     @Req() req: AuthenticatedRequest,
//     @Param('id') userId: string,
//     @Body('newRole') newRole: Role,
//   ) {
//     return await this.usersService.assignRole(req, userId, newRole);
//   }

//   @Get()
//   @Roles(Role.ADMIN)
//   async getAllUsers(@Req() req: AuthenticatedRequest) {
//     return this.usersService.getAllUsers(req);
//   }

//   @Get(':id')
//   async getUserById(
//     @Req() req: AuthenticatedRequest,
//     @Param('id') userId: string,
//   ) {
//     return this.usersService.getSingleUser(req, userId);
//   }

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
// }
