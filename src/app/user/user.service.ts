import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { RegisterDto } from '../auth/auth.dto';
import { UpdateUserDTO } from './user.dto';
import { ProfileInterface } from '../auth/auth.interface';
import { CustomRequest, GET_PROFILE } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { User, UserDocument } from '../models/user.schema';
import { singleImageValidation } from 'src/utils/file-validation';
import { deleteImageS3, saveImageS3 } from '../fileUpload/image-upload.service';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(dto: RegisterDto): Promise<UserDocument> {
    const user = new this.userModel(dto);
    return user.save();
  }

  async updateUser(
    updateProfile: Partial<UpdateUserDTO>,
    picture: Express.Multer.File,
    req: CustomRequest,
  ) {
    console.log('updateUser');
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'state',
      'city',
      'country',
      'street',
    ];
    for (const key of Object.keys(updateProfile)) {
      if (!allowedFields.includes(key)) delete updateProfile[key];
    }

    const user = await this.userModel.findOne({ _id: req.userId });
    if (!user) {
      throw customError.notFound('User not found');
    }

    if (picture) {
      singleImageValidation(picture, 'User picture');

      if (user.picture) {
        try {
          await deleteImageS3(user.picture);
        } catch (err) {
          console.warn('Failed to delete old cover image:', err.message);
        }
      }

      const uploadImg = await saveImageS3(picture, `images/users`);
      if (!uploadImg) {
        throw customError.badRequest('Invalid cover image');
      }
      user.picture = uploadImg;
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
