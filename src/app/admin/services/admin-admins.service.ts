import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TokenManager } from 'src/security/services/token-manager.service';

import { customError } from 'src/libs/custom-handlers';
import {
  UserAdmin,
  UserAdminDocument,
  AdminStatus,
} from 'src/models/admin.schema';
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
  SuspendStatus,
  SuspendUserDTO,
} from '../admin.dto';

import { CustomRequest } from 'src/utils/auth-utils';

@Injectable()
export class AdminAdminsService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    private emailService: EmailService,
    private readonly tokenManager: TokenManager,
  ) {}

  async getSingleAdmin(adminId: string, req: CustomRequest) {
    const user = await this.adminModel.findById(req.userId);
    if (!user) {
      throw customError.notFound('User not found');
    }

    const admin = await this.adminModel.findOne({ _id: adminId });
    if (!admin) throw customError.notFound('Admin not found');
    
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );
    return {
      accessToken,
      refreshToken,
      admin,
      message: 'Admin fetched successfully',
    };
  }

  async getAdmins(query: any, req: CustomRequest) {
    const user = await this.adminModel.findById(req.userId);
    if (!user) {
      throw customError.notFound('User not found');
    }

    const { search, status, page = 1, limit = 10 } = query;

    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const admins = await this.adminModel
      .find( filter )
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    const total = await this.adminModel.countDocuments(filter);
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );
    return {
      accessToken,
      refreshToken,
      admins: admins,
      page: Number(page),
      total,
      message: 'Admins fetched successfully',
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

    const newAdmin = new this.adminModel({
      email,
      signedUp: false,
      isActive: false,
      emailVerified: false,
      status: AdminStatus.PENDING,
    });

    await newAdmin.save();

    this.emailService.adminInvitationEmail(email);

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Admin has been added successfully',
    };
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

    if (
      action === SuspendStatus.ACTIVATE &&
      user.status === AdminStatus.APPROVED
    ) {
      throw customError.badRequest('Admin is already approved');
    }

    if (
      action === SuspendStatus.SUSPEND &&
      user.status === AdminStatus.SUSPENDED
    ) {
      throw customError.badRequest('Admin is already suspended');
    }
    if (action === SuspendStatus.ACTIVATE) {
      user.isActive = true;
      user.status = AdminStatus.APPROVED;
    } else {
      user.isActive = false;
      user.status = AdminStatus.SUSPENDED;
    }

    // user.actions = [...(user.actions || []), newAction];
    // admin.actions = [...(admin.actions || []), newAdminAction];

    await user.save();
    await admin.save();

    this.emailService.suspensionEmail(
      user.email,
      user.firstName,
      action,
      suspensionReason || '',
    );

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'User account has been updated.',
    };
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

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Admin permissions have been updated',
    };
  }

  async findAdminById(id: string) {
    const admin = await this.adminModel.findById(id);
    return { admin };
  }
}
