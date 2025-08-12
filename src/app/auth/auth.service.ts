import { UsersService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    return { message: 'User registered successfully', user };
  }

  // async login(dto: LoginDto) {
  //   const user = await this.usersService.findByEmail(dto.email);
  //   if (!user || !(await user.validatePassword(dto.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   const payload = { sub: user.id, email: user.email, role: user.role };
  //   return { access_token: this.jwtService.sign(payload) };
  // }

  // async register(body: RegisterDto) {
  //   const { email, password, confirmPassword, phone, name } = body;
  //   const existingUser = await this.userModel.findOne({ email });
  //   if (existingUser) {
  //     throw new ConflictException('User already exists');
  //   }
  //   if (password !== confirmPassword) {
  //     throw new UnauthorizedException('Passwords do not match');
  //   }

  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   try {
  //     const user = new this.userModel({
  //       email,
  //       password: hashedPassword,
  //       phone,
  //       name,
  //     });
  //     await user.save();
  //     const { role, isVerified, _id } = user;

  //     const token = this.jwtService.sign({ email }, { expiresIn: '1d' });
  //     await this.emailService.sendVerificationEmail(email, token);

  //     return {
  //       message:
  //         'User registered successfully. Check your email for the verification link.',
  //       user: { email, phone, name, isVerified, role, _id },
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async login(loginDto: LoginDto) {
  //   const { email, password } = loginDto;
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }

  //   const isPasswordValid = await bcrypt.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   const payload = {
  //     sub: user._id,
  //     email: user.email,
  //     role: user.role,
  //     phone: user.phone,
  //     isVerified: user.isVerified,
  //   };
  //   const accessToken = this.jwtService.sign(payload);
  //   const userDetails = {
  //     email: user.email,
  //     phone: user.phone,
  //     role: user.role,
  //     name: user.name,
  //     isVerified: user.isVerified,
  //     id: user._id,
  //   };

  //   return { message: 'Welcome back', accessToken, userDetails };
  // }

  // async resendVerificationEmail(email: string): Promise<string> {
  //   const user = await this.userModel.findOne({ email });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   if (user.isVerified) {
  //     throw new BadRequestException('Email is already verified');
  //   }

  //   const verificationToken = this.jwtService.sign(
  //     { email: user.email },
  //     { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '1d' },
  //   );

  //   await this.emailService.sendVerificationEmail(email, verificationToken);

  //   return 'Verification email resent successfully!';
  // }

  // async verifyEmail(token: string): Promise<string> {
  //   try {
  //     const payload = this.jwtService.verify(token, {
  //       secret: this.configService.get<string>('JWT_SECRET'),
  //     });

  //     const user = await this.userModel.findOne({ email: payload.email });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     if (user.isVerified) {
  //       throw new BadRequestException('Email is already verified');
  //     }

  //     user.isVerified = true;
  //     await user.save();

  //     return 'Email successfully verified!';
  //   } catch (error) {
  //     throw new BadRequestException('Invalid or expired token');
  //   }
  // }

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
