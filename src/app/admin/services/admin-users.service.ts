import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TokenManager } from 'src/security/services/token-manager.service';
import { EmailService } from '../../email/email.service';
import { UserAdmin, UserAdminDocument } from 'src/models/admin.schema';
import { User, UserDocument } from 'src/models/user.schema';
import { VerifyEmailDTO } from '../../auth/auth.dto';
import { SuspendUserDTO } from '../admin.dto';
import { AdminProfileInterface } from '../admin.interface';
import { CustomRequest, generateToken, GET_PROFILE } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { GET_ADMIN_PROFILE } from 'src/utils/admin-auth-utils';
import { Course, CourseDocument } from 'src/models/course.schema';
import { Enrollment, EnrollmentDocument } from 'src/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/models/earning.schema';
import { Payment, PaymentDocument } from 'src/models/payment.schema';
import { UpdateUserDTO } from 'src/app/user/user.dto';
import { singleImageValidation } from 'src/utils/file-validation';
import { deleteImageS3, saveImageS3 } from 'src/app/fileUpload/image-upload.service';
import { ProfileInterface } from 'src/app/auth/auth.interface';


@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    private emailService: EmailService,
    private readonly tokenManager: TokenManager,
  ) {}



  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) {
      throw customError.badRequest('Access Denied');
    }

    if (admin.emailVerified) {
      throw customError.badRequest('Email verified already');
    }

    if (admin.emailCode !== trimmedEmailCode) {
      throw customError.badRequest('Invalid verification code');
    }

    try {
      admin.emailVerified = true;
      admin.emailCode = null;
      await admin.save();

      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(admin);

      return {
        accessToken: req.token,
        profile,
        message: 'Email Verified Successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
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
      'bio',
    ];
    for (const key of Object.keys(updateProfile)) {
      if (!allowedFields.includes(key)) delete updateProfile[key];
    }

    const user = await this.adminModel.findOne({ _id: req.userId });
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
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      profile,
      message: 'Profile updated successfully',
    };
  }

  async viewProfile(req: CustomRequest) {
    console.log('viewProfile');

    const user = await this.adminModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    const profile: ProfileInterface = GET_PROFILE(user);
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      profile,
      message: 'Profile fetched successfully',
    };
  }
}
