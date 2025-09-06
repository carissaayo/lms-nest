import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDto, VerifyEmailDTO } from '../../auth/auth.dto';
import { CustomRequest, generateToken } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import {
  UserAdmin,
  UserAdminDocument,
  AdminStatus,
} from 'src/app/models/admin.schema';
import { EmailService } from '../../email/email.service';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { AdminProfileInterface, PermissionsEnum } from '../admin.interface';
import {
  AddAnAdminDTO,
  AssignPermissionsDTO,
  PermissionsActions,
  SuspendUserDTO,
} from '../admin.dto';

@Injectable()
export class AdminAdminsService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    private emailService: EmailService,
  ) {}

  async viewProfile(req: CustomRequest) {
    console.log('viewProfile');

    const user = await this.adminModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);

    return {
      accessToken: req.token,
      profile,
      message: 'Profile fetched successfully',
    };
  }

  async addAdminByEmail(dto: AddAnAdminDTO, req: CustomRequest) {
    const { email } = dto;

    const existing = await this.adminModel.findOne({ email });
    if (existing) {
      throw customError.conflict('Admin with this email already exists');
    }

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    try {
      const newAdmin = new this.adminModel({
        email,
        signedUp: false,
        isActive: false,
        emailVerified: false,
        status: AdminStatus.PENDING,
      });

      await newAdmin.save();

      await this.emailService.adminInvitationEmail(email);

      return {
        accessToken: req.token,
        message: 'Admin has been added successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

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

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    const user = await this.adminModel.findById(userId);
    if (!user) throw customError.notFound('User not found');

    try {
      const newAction = {
        action: `User is ${action}ed by ${admin.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      const newAdminAction = {
        action: `${action}ed a User ${user.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      user.isActive = false;
      user.actions = [...(user.actions || []), newAction];
      admin.actions = [...(admin.actions || []), newAdminAction];

      await user.save();
      await admin.save();

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
    dto: AssignPermissionsDTO,
    req: CustomRequest,
  ) {
    if (!userId) throw customError.badRequest('UserId is required');

    const { permissions: newPermissions, action } = dto;

    if (!newPermissions) {
      throw customError.badRequest('Permission array is required');
    }

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    const user = await this.adminModel.findById(userId);
    if (!user) throw customError.notFound('User not found');

    try {
      if (!user.permissions) {
        user.permissions = [];
      }

      let updatedPermissions: PermissionsEnum[] = [];

      if (action === PermissionsActions.ADD) {
        updatedPermissions = [
          ...new Set([...user.permissions, ...newPermissions]),
        ];
      } else if (action === PermissionsActions.REMOVE) {
        updatedPermissions = user.permissions.filter(
          (perm) => !newPermissions.includes(perm),
        );
      }

      user.permissions = updatedPermissions;
      await user.save();

      const { token, refreshToken } = await generateToken(admin, req);
      return {
        accessToken: token,
        refreshToken: refreshToken,
        message: 'Admin permissions have been updated',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      throw customError.unauthorized('Admin not found');
    }

    try {
      const isPasswordValid = await admin.validatePassword(password);

      if (!isPasswordValid) {
        await handleFailedAuthAttempt(admin, this.adminModel);
      }

      admin.failedAuthAttempts = 0;
      await admin.save();

      const { token, refreshToken, session } = await generateToken(admin, req);

      admin.sessions = [session];
      admin.failedSignInAttempts = 0;
      admin.nextSignInAttempt = new Date();
      await admin.save();

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

  async findAdminById(id: string) {
    const admin = await this.adminModel.findById(id);
    return { admin };
  }
}
