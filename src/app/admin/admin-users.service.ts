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
    @InjectRepository(User) private userRepo: Repository<User>,
    private emailService: EmailService,
  ) {}

  /**
   * : Suspend an User
   */
  async suspendUser(
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
    const user = await this.userRepo.findOne({
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
      this.userRepo.save(user);
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
