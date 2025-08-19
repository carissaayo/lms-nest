import { Injectable } from '@nestjs/common';
import {
  ChangePasswordDTO,
  LoginDto,
  RegisterDto,
  RequestResetPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from './auth.dto';

import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { customError } from 'libs/custom-handlers';
import { formatPhoneNumber, generateOtp } from 'src/utils/utils';
import { EmailService } from '../email/email.service';
import { CustomRequest, generateToken } from 'src/utils/auth-utils';

import { UserAdmin } from '../admin/admin.entity';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { AdminProfileInterface } from '../admin/admin.interface';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(UserAdmin) private usersRepo: Repository<UserAdmin>,
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
      role,
    } = body;

    // Check password match
    if (password !== confirmPassword) {
      throw customError.conflict('Passwords do not match ', 409);
    }
    const formattedPhone = formatPhoneNumber(phoneNumber, '234');
    if (formattedPhone?.toString()?.length !== 13) {
      throw customError.badRequest(
        'The phone number you entered is not correct. Please follow this format: 09012345678',
      );
    }
    // Check if user already exists
    const existingUser = await this.usersRepo.findOne({ where: { email } });
    if (!existingUser) {
      throw customError.forbidden('You have to be added up first');
    }

    if (existingUser.isActive)
      throw customError.conflict('You have already signed up');
    try {
      const emailCode = generateOtp('numeric', 8);
      // Create new user entity
      const user = this.usersRepo.create({
        email,
        password,
        phoneNumber: formattedPhone,
        firstName,
        lastName,
        role,
        emailCode,
      });

      // Save to DB
      const savedUser = await this.usersRepo.save(user);

      const { emailVerified, id } = savedUser;

      // // Send verification email
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
          id,
        },
      };
    } catch (error) {
      throw customError.internalServerError('Internal Server Error ', 500);
    }
  }

  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    // Find user by email in Postgres (TypeORM)
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw customError.unauthorized('User not found');
    }
    try {
      // validate password using entity method
      const isPasswordValid = await user.validatePassword(password);

      if (!isPasswordValid) {
        await handleFailedAuthAttempt(user, this.usersRepo);
      }

      user.failedAuthAttempts = 0;
      await this.usersRepo.save(user);

      // Regenerate access token
      const { token, refreshToken, session } = await generateToken(user, req);

      // Store session in an array as required by the schema
      user.sessions = [session];
      user.failedSignInAttempts = 0;
      user.nextSignInAttempt = new Date();
      await this.usersRepo.save(user);
      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);

      return {
        accessToken: token,
        refreshToken: refreshToken,
        profile: profile,
        message: 'Signed In successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const user = await this.usersRepo.findOne({
      where: { id: req.userId },
    });
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

    await this.usersRepo.save(user);

    const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);

    return {
      accessToken: req.token,
      profile,
      message: 'Email Verified Successfully',
    };
  }

  async requestResetPassword(resetPasswordDto: RequestResetPasswordDTO) {
    console.log('requestResetPassword');

    const { email } = resetPasswordDto;

    const user = await this.usersRepo.findOne({ where: { email } });

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
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      await this.usersRepo.save(user);

      // Send password reset email
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
    console.log('resetPassword');

    const { email, passwordResetCode, newPassword } = resetPasswordDto;

    // Find user with matching code and unexpired reset time
    const user = await this.usersRepo.findOne({
      where: {
        email,
        passwordResetCode,
        resetPasswordExpires: MoreThan(new Date()),
      },
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

      await this.usersRepo.save(user);

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
    console.log('changePassword');

    const { password, newPassword, confirmNewPassword } = changePasswordDto;

    const user = await this.usersRepo.findOne({ where: { id: req.userId } });

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

      await this.usersRepo.save(user);

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }
}
