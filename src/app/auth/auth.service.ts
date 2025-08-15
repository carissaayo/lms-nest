import { Injectable } from '@nestjs/common';
import {
  LoginDto,
  RegisterDto,
  RequestResetPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailDTO,
} from './auth.dto';
import { User } from '../user/user.entity';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { customError } from 'libs/custom-handlers';
import { formatPhoneNumber, generateOtp } from 'src/utils/utils';
import { EmailService } from '../email/email.service';
import {
  CustomRequest,
  generateToken,
  GET_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/auth-utils';
import { ProfileInterface } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
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
    if (existingUser) {
      throw customError.conflict('Email has already been used ', 409);
    }
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

    // validate password using entity method
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      await handleFailedAuthAttempt(user, this.usersRepo);
    }

    user.failedAuthAttempts = 0;
    await this.usersRepo.save(user);

    // Regenerate access token
    const { token, refreshToken, session } = await generateToken(
      user.id.toString(),
      req,
    );

    // Store session in an array as required by the schema
    user.sessions = [session];
    user.failedSignInAttempts = 0;
    user.nextSignInAttempt = new Date();
    await this.usersRepo.save(user);
    const profile: ProfileInterface = GET_PROFILE(user);

    return {
      accessToken: token,
      refreshToken: refreshToken,
      profile: profile,
      message: 'Signed In successfully',
    };
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

    const profile: ProfileInterface = GET_PROFILE(user);

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

    const resetCode = generateOtp('numeric', 8);
    user.passwordResetCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await this.usersRepo.save(user);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(email, resetCode);

    return {
      message: 'PASSWORD RESET CODE SENT TO YOUR EMAIL',
    };
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

    // Hash new password
    await user.hasNewPassword(newPassword);

    user.passwordResetCode = null;
    user.resetPasswordExpires = null;

    await this.usersRepo.save(user);

    return {
      message: 'Password reset successfully',
    };
  }
  // async changePassword(
  //   req: AuthenticatedRequest,
  //   changePasswordDto: ChangePasswordDto,
  // ): Promise<string> {
  //   const { currentPassword, newPassword, confirmNewPassword } =
  //     changePasswordDto;
  //   if (!currentPassword || !newPassword || !confirmNewPassword) {
  //     throw new UnauthorizedException('Password(s) not provided');
  //   }

  //   const user = await this.userModel.findById(req.user.id);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   const isMatch = await bcrypt.compare(currentPassword, user.password);
  //   if (!isMatch) {
  //     throw new UnauthorizedException("Current password isn't correct");
  //   }

  //   if (newPassword !== confirmNewPassword) {
  //     throw new UnauthorizedException('New passwords do not match');
  //   }

  //   const hashedPassword = await bcrypt.hash(
  //     newPassword,
  //     Number(this.configService.get<string>('SALTROUNDS')),
  //   );
  //   await this.userModel.findByIdAndUpdate(req.user.id, {
  //     password: hashedPassword,
  //   });

  //   return 'Password changed successfully';
  // }

  // async requestResetPasswordLink(
  //   req: AuthenticatedRequest,
  //   userEmail: string,
  // ): Promise<string> {
  //   const email = req.user.email;

  //   if (email !== userEmail) {
  //     throw new UnauthorizedException(
  //       'Email is different from the registered one',
  //     );
  //   }

  //   const user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     throw new NotFoundException('No user found with the email');
  //   }

  //   const token = this.jwtService.sign(
  //     { email },
  //     { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1h' },
  //   );

  //   await this.emailService.sendResetPasswordEmail(email, token);

  //   return 'Password reset email sent';
  // }

  // async createNewPassword(res: Response, token: string): Promise<any> {
  //   try {
  //     const decoded = this.jwtService.verify(token, {
  //       secret: this.configService.get<string>('JWT_SECRET'),
  //     });
  //     const user = await this.userModel.findOne({ email: decoded.email });

  //     if (!user) {
  //       throw new NotFoundException('No user found with the email');
  //     }

  //     // Return raw HTML
  //     return `
  //     <h1>Reset Password</h1>
  //     <form action="/api/reset-password" method="POST">
  //       <input type="hidden" name="token" value="${token}" />
  //       <label for="password">New Password:</label>
  //       <input type="password" name="password" required />
  //       <input type="password" name="confirmPassword" required />
  //       <button type="submit">Reset Password</button>
  //     </form>
  //   `;
  //   } catch (error) {
  //     throw new BadRequestException('Invalid or expired token');
  //   }
  // }

  // async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<string> {
  //   try {
  //     const { token, newPassword, confirmNewPassword } = resetPasswordDto;

  //     if (!token || !newPassword || !confirmNewPassword) {
  //       throw new BadRequestException('All fields are required.');
  //     }

  //     if (newPassword !== confirmNewPassword) {
  //       throw new BadRequestException('Passwords do not match.');
  //     }

  //     const decoded = this.jwtService.verify(token, {
  //       secret: this.configService.get<string>('JWT_SECRET'),
  //     });
  //     const user = await this.userModel.findOne({ email: decoded.email });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     const hashedPassword = await bcrypt.hash(
  //       newPassword,
  //       Number(this.configService.get<string>('SALTROUNDS')),
  //     );
  //     await this.userModel.findByIdAndUpdate(user._id, {
  //       password: hashedPassword,
  //     });

  //     return 'Password reset successfully!';
  //   } catch (error) {
  //     throw new BadRequestException('Invalid or expired token');
  //   }
  // }
}
