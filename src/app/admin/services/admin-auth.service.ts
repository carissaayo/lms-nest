import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';

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
import { UserAdmin, UserAdminDocument } from 'src/models/admin.schema';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { AdminProfileInterface } from '../admin.interface';
import config from 'src/app/config/config';
import { TokenManager } from 'src/security/services/token-manager.service';

const appConfig = config();
@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    private emailService: EmailService,
        private readonly tokenManager: TokenManager,
    
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

      
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.phoneNumber = phoneNumber;
      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.emailCode = emailCode;
      existingUser.password = hashedPassword;
      await existingUser.save();
     this.emailService.sendVerificationEmail(email, emailCode);

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
      throw customError.unauthorized('Admin not found');
    }

    try {
    
    await this.validatePassword(user, password);
 

    
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);

      return {
        accessToken,
        refreshToken,
        profile,
        message: 'Signed In successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(error.message, error.statusCode);
    }
  }

  private async validatePassword(user: UserAdmin, password: string): Promise<void> {
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  
        if (user.failedLoginAttempts >= Number(appConfig.max_failed_attempts)) {
          user.lockUntil = new Date(Date.now() + appConfig.lock_time);
          user.failedLoginAttempts = 0; // reset after lock
        }
  
        await user.save();
        throw customError.unauthorized('Invalid credentials');
      }
  
      // ✅ Successful login → reset counters
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();
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

     this.emailService.sendPasswordResetEmail(email, resetCode);

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
       const hashedPassword = await bcrypt.hash(newPassword, 10);
     
       user.password = hashedPassword;
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
   
      await this.validatePassword(user, password);
      if (newPassword !== confirmNewPassword) {
        throw customError.badRequest('New passwords do not match');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
    
      user.password = hashedPassword;
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
