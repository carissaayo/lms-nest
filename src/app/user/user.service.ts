import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RegisterDto } from '../auth/auth.dto';
import { UpdateUserDTO } from './user.dto';
import { ProfileInterface } from '../auth/auth.interface';
import { CustomRequest, GET_PROFILE } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { User, UserDocument } from '../models/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: RegisterDto): Promise<UserDocument> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async updateUser(updateProfile: UpdateUserDTO, req: CustomRequest) {
    console.log('updateUser');

    const user = await this.userModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    // Update user fields
    Object.assign(user, updateProfile);
    await user.save();

    // build profile
    const profile: ProfileInterface = GET_PROFILE(user);

    return {
      accessToken: req.token || '',
      profile,
      message: 'Profile updated successfully',
    };
  }

  async viewProfile(req: CustomRequest) {
    console.log('viewProfile');

    const user = await this.userModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    const profile: ProfileInterface = GET_PROFILE(user);

    return {
      accessToken: req.token || '',
      profile,
      message: 'Profile fetched successfully',
    };
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
