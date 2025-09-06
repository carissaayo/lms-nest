import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailService } from 'src/app/email/email.service';

import {
  ChangePasswordDTO,
  LoginDto,
  RegisterDto,
  RequestResetPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from '../auth.dto';

import { ProfileInterface } from '../auth.interface';
import { User, UserDocument } from 'src/app/models/user.schema';

import { customError } from 'src/libs/custom-handlers';
import { formatPhoneNumber, generateOtp } from 'src/utils/utils';
import {
  CustomRequest,
  generateToken,
  GET_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/auth-utils';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
  ) {}

  /** ----------------- PASSWORD HELPERS ----------------- */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async validatePassword(
    password: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  /** ----------------- REGISTER ----------------- */
  async register(body: RegisterDto) {
    const {
      email,
      password,
      confirmPassword,
      phoneNumber,
      firstName,
      lastName,
      role,
    } = body;

    if (password !== confirmPassword) {
      throw customError.conflict('Passwords do not match', 409);
    }

    const formattedPhone = formatPhoneNumber(phoneNumber, '234');
    if (formattedPhone?.toString()?.length !== 13) {
      throw customError.badRequest(
        'The phone number you entered is not correct. Please follow this format: 09012345678',
      );
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw customError.conflict('Email has already been used', 409);
    }

    try {
      const emailCode = generateOtp('numeric', 8);
      const hashedPassword = await this.hashPassword(password);

      const user = new this.userModel({
        email,
        password: hashedPassword,
        phoneNumber: formattedPhone,
        firstName,
        lastName,
        role,
        emailCode,
      });

      const savedUser = await user.save();
      const { emailVerified, _id } = savedUser;

      await this.emailService.sendVerificationEmail(email, emailCode);

      return {
        message:
          'User registered successfully. Check your email for the verification link.',
        user: {
          email,
          phoneNumber,
          firstName,
          lastName,
          emailVerified,
          role,
          id: _id,
        },
      };
    } catch (error) {
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /** ----------------- LOGIN ----------------- */
  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw customError.unauthorized('User not found');
    }

    try {
      const isPasswordValid = await this.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        await handleFailedAuthAttempt(user, this.userModel);
      }

      user.failedAuthAttempts = 0;
      await user.save();

      const { token, refreshToken, session } = await generateToken(user, req);

      user.sessions = [session];
      user.failedSignInAttempts = 0;
      user.nextSignInAttempt = new Date();
      await user.save();

      const profile: ProfileInterface = GET_PROFILE(user);

      return {
        accessToken: token,
        refreshToken,
        profile,
        message: 'Signed In successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /** ----------------- VERIFY EMAIL ----------------- */
  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const user = await this.userModel.findById(req.userId);
    if (!user) {
      throw customError.badRequest('Access Denied');
    }

    if (user.emailVerified) {
      throw customError.badRequest('Email verified already');
    }

    if (user.emailCode !== trimmedEmailCode) {
      throw customError.badRequest('Invalid verification code');
    }

    user.emailVerified = true;
    user.emailCode = null;
    await user.save();

    const profile: ProfileInterface = GET_PROFILE(user);

    return {
      accessToken: req.token,
      profile,
      message: 'Email Verified Successfully',
    };
  }

  /** ----------------- REQUEST RESET PASSWORD ----------------- */
  async requestResetPassword(resetPasswordDto: RequestResetPasswordDTO) {
    const { email } = resetPasswordDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw customError.badRequest('User not found');
    }

    if (!user.isActive) {
      throw customError.badRequest(
        'Your account has been suspended. Please contact the administrator',
      );
    }

    try {
      const resetCode = generateOtp('numeric', 8);
      user.passwordResetCode = resetCode;
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);

      await user.save();
      await this.emailService.sendPasswordResetEmail(email, resetCode);

      return { message: 'PASSWORD RESET CODE SENT TO YOUR EMAIL' };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /** ----------------- RESET PASSWORD ----------------- */
  async resetPassword(resetPasswordDto: ResetPasswordDTO) {
    const { email, passwordResetCode, newPassword } = resetPasswordDto;

    const user = await this.userModel.findOne({
      email,
      passwordResetCode,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw customError.badRequest('Invalid or expired reset code');
    }

    if (!user.isActive) {
      throw customError.badRequest(
        'Your account has been suspended. Please contact the administrator',
      );
    }

    try {
      user.password = await this.hashPassword(newPassword);
      user.passwordResetCode = null;
      user.resetPasswordExpires = null;

      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /** ----------------- CHANGE PASSWORD ----------------- */
  async changePassword(
    changePasswordDto: ChangePasswordDTO,
    req: CustomRequest,
  ) {
    const { password, newPassword, confirmNewPassword } = changePasswordDto;

    const user = await this.userModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    try {
      const isPasswordValid = await this.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw customError.badRequest('Current password is incorrect');
      }

      if (newPassword !== confirmNewPassword) {
        throw customError.badRequest('New passwords do not match');
      }

      user.password = await this.hashPassword(newPassword);
      await user.save();

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }
}
