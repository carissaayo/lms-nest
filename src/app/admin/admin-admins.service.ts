import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto, VerifyEmailDTO } from '../auth/auth.dto';
import { CustomRequest, generateToken } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { AdminStatus, UserAdmin } from './admin.entity';
import { EmailService } from '../email/email.service';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { AdminProfileInterface } from './admin.interface';
import { SuspendStatus, SuspendUserDTO } from './admin.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(UserAdmin) private adminRepo: Repository<UserAdmin>,
    private emailService: EmailService,
  ) {}

  /**
   * Add admin by email
   */
  async addAdminByEmail(email: string, req: CustomRequest) {
    const existing = await this.adminRepo.findOne({ where: { email } });
    if (existing) {
      throw customError.conflict('Admin with this email already exists');
    }

    try {
      const admin = this.adminRepo.create({
        email,
        signedUp: false,
        isActive: false,
        emailVerified: false,
        status: AdminStatus.PENDING,
      });

      this.adminRepo.save(admin);

      await this.emailService.adminInvitationEmail(email);
      return {
        accessToken: req.token,
        message: 'Admin has ben added successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /**
   * : Suspend an User
   */
  async suspendAdmin(
    userId: string,
    suspendDto: SuspendUserDTO,
    req: CustomRequest,
  ) {
    const { action, suspensionReason } = suspendDto;
    if (!userId) throw customError.badRequest('UserId is required');

    if (!action) {
      throw customError.badRequest('Action is required');
    }

    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }
    const user = await this.adminRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw customError.notFound('User not found');
    try {
      const newAction = {
        action: `User is ${action}ed by ${admin.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      const newAdminAction = {
        action: `${action}ed a User  ${user.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      user.isActive = false;
      user.actions.push(newAction);
      admin.actions.push(newAdminAction);
      this.adminRepo.save(user);
      this.adminRepo.save(admin);

      await this.emailService.suspensionEmail(
        user.email,
        user.firstName,
        action,
        suspensionReason || '',
      );
      const { token, refreshToken } = await generateToken(admin, req);
      return {
        accessToken: token,
        refreshToken: refreshToken,
        message: 'User account has been suspended.',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async assignPermission(
    userId: string,
    suspendDto: SuspendUserDTO,
    req: CustomRequest,
  ) {
    const { action, suspensionReason } = suspendDto;
    if (!userId) throw customError.badRequest('UserId is required');

    if (!action) {
      throw customError.badRequest('Action is required');
    }

    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }
    const user = await this.adminRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw customError.notFound('User not found');
    try {
      const newAction = {
        action: `User is ${action}ed by ${admin.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      const newAdminAction = {
        action: `${action}ed a User  ${user.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      user.isActive = false;
      user.actions.push(newAction);
      admin.actions.push(newAdminAction);
      this.adminRepo.save(user);
      this.adminRepo.save(admin);

      await this.emailService.suspensionEmail(
        user.email,
        user.firstName,
        action,
        suspensionReason || '',
      );
      const { token, refreshToken } = await generateToken(admin, req);
      return {
        accessToken: token,
        refreshToken: refreshToken,
        message: 'User account has been suspended.',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }
  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw customError.unauthorized('admin not found');
    }

    try {
      const isPasswordValid = await admin.validatePassword(password);

      if (!isPasswordValid) {
        await handleFailedAuthAttempt(admin, this.adminRepo);
      }

      admin.failedAuthAttempts = 0;
      await this.adminRepo.save(admin);

      const { token, refreshToken, session } = await generateToken(admin, req);

      admin.sessions = [session];
      admin.failedSignInAttempts = 0;
      admin.nextSignInAttempt = new Date();
      await this.adminRepo.save(admin);
      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(admin);

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

  /**
   *  Verify email
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const admin = await this.adminRepo.findOne({
      where: { id: req.userId },
    });
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

      await this.adminRepo.save(admin);

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
}
