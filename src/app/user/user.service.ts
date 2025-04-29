import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './user.schema'; // path based on your folder structure
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './user.dto'; // Assume you have these DTOs
import { generateToken, transporter } from '../middlewares/emailVerification'; // adjust import if needed

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}



  async makeUserAdmin(id: string, currentUser: User) {
    const existingUser = await this.userModel.findOne({ _id: id, deleted: false });
    if (!existingUser) throw new NotFoundException('User not found');

    const mainAdmin = await this.userModel.findOne({ email: process.env.ADMIN_EMAIL });
    if (mainAdmin.id !== currentUser.id) {
      throw new UnauthorizedException('Access Denied, only the super admin can make a user an admin');
    }
    if (mainAdmin.id === id) {
      throw new UnauthorizedException('You are the super admin');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, { isAdmin: true, role: 'moderator' }, { new: true });
    return { message: 'User role updated successfully', user: updatedUser };
  }

  async assignRole(id: string, role: string, currentUser: User) {
    if (!currentUser.isAdmin) {
      throw new UnauthorizedException('Access Denied, only an admin can change roles');
    }

    const user = await this.userModel.findOne({ _id: id, isVerified: true, deleted: false });
    if (!user) {
      throw new NotFoundException('User not verified or found');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, { role }, { new: true });
    return { message: 'User role updated successfully', user: updatedUser };
  }

  async verifyUser(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as any;

      const deletedUser = await this.userModel.findOne({ email: decoded.email, deleted: true });
      if (deletedUser) throw new UnauthorizedException('User has been deleted');

      const existingUser = await this.userModel.findOne({ email: decoded.email, deleted: false });
      if (!existingUser) throw new UnauthorizedException('User does not exist');

      existingUser.isVerified = true;
      await existingUser.save();
      return '<h1>Email verified successfully!</h1>';
    } catch (error) {
      console.error('Verification error:', error);
      throw new BadRequestException('<h1>Invalid or expired token</h1>');
    }
  }



  async logoutUser() {
    // In NestJS, usually logout is handled on frontend by clearing token from client
    return { message: 'You have been logged out' };
  }

  async getSingleUser(id: string, currentUser: User) {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) throw new NotFoundException('User not found');

    if (!currentUser.isAdmin && user.role !== 'instructor') {
      throw new UnauthorizedException('No Instructor found');
    }

    const { name, _id, courses, role } = existingUser;
    return { message: 'User details fetched successfully', user: { name, _id, courses, role } };
  }

  async getSingleUserByAdmin(id: string, currentUser: User) {
    if (!currentUser.isAdmin) {
      throw new UnauthorizedException("Access Denied, you don't have the permission");
    }

    const deletedUser = await this.userModel.findOne({ _id: id, deleted: true });
    if (deletedUser) throw new UnauthorizedException('User has been deleted');

    const existingUser = await this.userModel.findOne({ _id: id, deleted: false });
    if (!existingUser) throw new NotFoundException('User not found');

    const { password, ...userDetails } = existingUser.toObject();
    return { message: 'User details fetched successfully', userDetails };
  }

  async getAllUsers(currentUser: User) {
    if (!currentUser.isAdmin) {
      throw new UnauthorizedException('Access Denied, you are not allowed');
    }

    const users = await this.userModel.aggregate([
      { $match: { email: { $ne: process.env.ADMIN_EMAIL }, deleted: false } },
    ]);

    return { message: 'All users fetched successfully', users };
  }

  async updateUserProfile(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    const deletedUser = await this.userModel.findOne({ _id: id, deleted: true });
    if (deletedUser) throw new UnauthorizedException('User has been deleted');

    const existingUser = await this.userModel.findOne({ _id: id, deleted: false });
    if (!existingUser) throw new NotFoundException('User not found');

    if (id !== currentUser.id) {
      throw new UnauthorizedException('Access Denied, you can only update your account');
    }

    if (updateUserDto.email) {
      const emailExists = await this.userModel.findOne({ email: updateUserDto.email });
      if (emailExists) throw new UnauthorizedException('Email has already been used');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
    return { message: 'User details updated successfully', user: updatedUser };
  }

  async deleteUser(id: string, currentUser: User) {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) throw new NotFoundException('User not found');

    if (!currentUser.isAdmin && currentUser.id !== id) {
      throw new UnauthorizedException('Access Denied, you can only delete your own account');
    }

    await this.userModel.findByIdAndUpdate(id, { deleted: true }, { new: true });
    return { message: 'User account has been deleted successfully' };
  }
}
