import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ChangePasswordDTO,
  LoginDto,
  RegisterDto,
  RequestResetPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from '../../auth/auth.dto';
import { customError } from 'src/libs/custom-handlers';
import { formatPhoneNumber, generateOtp } from 'src/utils/utils';
import { EmailService } from '../../email/email.service';
import { CustomRequest, generateToken } from 'src/utils/auth-utils';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { AdminProfileInterface } from '../admin.interface';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    private emailService: EmailService,
  ) {}

  async register(body: RegisterDto) {
    const {
      email,
      password,
      confirmPassword,
      phoneNumber,
      firstName,
      lastName,
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

    const existingUser = await this.adminModel.findOne({ email });
    if (!existingUser) {
      throw customError.forbidden('You have to be added up first');
    }

    if (existingUser.isActive) {
      throw customError.conflict('You have already signed up');
    }

    try {
      const emailCode = generateOtp('numeric', 8);

      await existingUser.hasNewPassword(password);
      existingUser.phoneNumber = phoneNumber;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.emailCode = emailCode;

      await existingUser.save();

      await this.emailService.sendVerificationEmail(email, emailCode);

      return {
        message:
          'User registered successfully. Check your email for the verification link.',
        user: {
          email,
          phoneNumber,
          firstName,
          lastName,
          emailVerified: existingUser.emailVerified,
          role: existingUser.role,
          id: existingUser.id,
        },
      };
    } catch (error) {
      throw customError.internalServerError(error.message, 500);
    }
  }

  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    const user = await this.adminModel.findOne({ email });
    if (!user) {
      throw customError.unauthorized('User not found');
    }

    try {
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        await handleFailedAuthAttempt(user, this.adminModel);
      }

      user.failedAuthAttempts = 0;
      await user.save();

      const { token, refreshToken, session } = await generateToken(user, req);

      user.sessions = [session];
      user.failedSignInAttempts = 0;
      user.nextSignInAttempt = new Date();
      await user.save();

      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);

      return {
        accessToken: token,
        refreshToken: refreshToken,
        profile: profile,
        message: 'Signed In successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(error.message, error.statusCode);
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const user = await this.adminModel.findById(req.userId);
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

    const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);

    return {
      accessToken: req.token,
      profile,
      message: 'Email Verified Successfully',
    };
  }

  async requestResetPassword(resetPasswordDto: RequestResetPasswordDTO) {
    const { email } = resetPasswordDto;

    const user = await this.adminModel.findOne({ email });
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

      return {
        message: 'PASSWORD RESET CODE SENT TO YOUR EMAIL',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDTO) {
    const { email, passwordResetCode, newPassword } = resetPasswordDto;

    const user = await this.adminModel.findOne({
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
      await user.hasNewPassword(newPassword);
      user.passwordResetCode = null;
      user.resetPasswordExpires = null;
      await user.save();

      return {
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDTO,
    req: CustomRequest,
  ) {
    const { password, newPassword, confirmNewPassword } = changePasswordDto;

    const user = await this.adminModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    try {
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw customError.badRequest('Current password is incorrect');
      }

      if (newPassword !== confirmNewPassword) {
        throw customError.badRequest('New passwords do not match');
      }

      await user.hasNewPassword(newPassword);
      await user.save();

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }
}
