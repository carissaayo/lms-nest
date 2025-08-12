import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: RegisterDto) {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }
  // async makeUserAdmin(req: AuthenticatedRequest, userId: string) {
  //   const user = await this.userModel.findOne({
  //     _id: userId,
  //   });
  //   if (!user) throw new NotFoundException('User not found');

  //   const mainAdmin = await this.userModel.findOne({
  //     email: this.configService.get<string>('admin.email'),
  //   });
  //   if (mainAdmin?.id !== req.user.id) {
  //     throw new UnauthorizedException(
  //       'Access Denied, only the super admin can make a user an admin',
  //     );
  //   }
  //   if (mainAdmin.id === req.user.id) {
  //     throw new UnauthorizedException('You are the super admin');
  //   }

  //   const updatedUser = await this.userModel.findByIdAndUpdate(
  //     userId,
  //     { isAdmin: true, role: 'moderator' },
  //     { new: true },
  //   );
  //   return { message: 'User role updated successfully', user: updatedUser };
  // }

  // async assignRole(req: AuthenticatedRequest, userId: string, newRole: string) {
  //   try {
  //     if (!req.user.isAdmin) {
  //       throw new UnauthorizedException(
  //         'Access Denied, only an admin can change roles',
  //       );
  //     }

  //     const user = await this.userModel.findOne({
  //       _id: userId,
  //       isVerified: true,
  //     });
  //     if (!user) {
  //       throw new NotFoundException('User not verified or found');
  //     }

  //     const updatedUser = await this.userModel.findByIdAndUpdate(
  //       userId,
  //       { role: newRole },
  //       { new: true },
  //     );
  //     return { message: 'User role updated successfully', user: updatedUser };
  //   } catch (error) {
  //     throw new InternalServerErrorException('Assigning new role failed');
  //   }
  // }

  // async getSingleUser(req: AuthenticatedRequest, userId: string) {
  //   const user = await this.userModel.findOne({ _id: userId });
  //   if (!user) throw new NotFoundException('User not found');

  //   const { name, _id, courses, role } = user;
  //   return {
  //     message: 'User details fetched successfully',
  //     user: { name, _id, courses, role },
  //   };
  // }

  // async getSingleUserByAdmin(req: AuthenticatedRequest, userId: string) {
  //   if (!req.user.isAdmin) {
  //     throw new UnauthorizedException(
  //       "Access Denied, you don't have the permission",
  //     );
  //   }

  //   const user = await this.userModel.findOne({
  //     _id: userId,
  //   });
  //   if (!user) throw new NotFoundException('User not found');

  //   const { password, ...userDetails } = user.toObject();
  //   return { message: 'User details fetched successfully', userDetails };
  // }

  // async getAllUsers(req: AuthenticatedRequest) {
  //   if (!req.user.isAdmin) {
  //     throw new UnauthorizedException('Access Denied, you are not allowed');
  //   }

  //   const users = await this.userModel.aggregate([
  //     {
  //       $match: {
  //         email: { $ne: this.configService.get<string>('admin.email') },
  //       },
  //     },
  //   ]);

  //   return { message: 'All users fetched successfully', users };
  // }

  // async updateUserProfile(
  //   req: AuthenticatedRequest,
  //   userId: string,
  //   body: UpdateUserDto,
  // ) {
  //   const user = await this.userModel.findOne({
  //     _id: userId,
  //   });
  //   if (!user) throw new NotFoundException('User not found');

  //   if (userId !== req.user.id) {
  //     throw new UnauthorizedException(
  //       'Access Denied, you can only update your account',
  //     );
  //   }

  //   if (body.email) {
  //     const emailExists = await this.userModel.findOne({
  //       email: body.email,
  //     });
  //     if (emailExists)
  //       throw new UnauthorizedException('Email has already been used');
  //   }

  //   const updatedUser = await this.userModel.findByIdAndUpdate(userId, body, {
  //     new: true,
  //   });
  //   return { message: 'User details updated successfully', user: updatedUser };
  // }

  // async deleteUser(req: AuthenticatedRequest, userId: string) {
  //   const user = await this.userModel.findOne({
  //     _id: userId,
  //   });
  //   if (!user) throw new NotFoundException('User not found');

  //   if (userId !== user.id) {
  //     throw new UnauthorizedException(
  //       'Access Denied, you can only delete your account',
  //     );
  //   }

  //   await this.userModel.findByIdAndUpdate(
  //     userId,
  //     { deleted: true },
  //     { new: true },
  //   );
  //   return { message: 'User account has been deleted successfully' };
  // }
}
