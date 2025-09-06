import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomRequest } from 'src/utils/auth-utils';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import { EmailService } from '../../email/email.service';
import { Payment, PaymentDocument } from 'src/app/models/payment.schema';
import { customError } from 'src/libs/custom-handlers';
import {
  Withdrawal,
  WithdrawalDocument,
} from 'src/app/models/withdrawal.schema';

@Injectable()
export class AdminPaymentsService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Withdrawal.name)
    private withdrawalModel: Model<WithdrawalDocument>,
    private emailService: EmailService,
  ) {}

  async getPayments(query: any, req: CustomRequest) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    const {
      status,
      provider,
      courseId,
      studentId,
      page = 1,
      limit = 10,
    } = query;
    const filter: any = {};

    if (status) filter.status = status.toLowerCase();
    if (provider) filter.provider = provider.toLowerCase();
    if (courseId) filter.course = courseId;
    if (studentId) filter.student = studentId;

    const payments = await this.paymentModel
      .find(filter)
      .populate('student')
      .populate('course')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.paymentModel.countDocuments(filter);

    return {
      accessToken: req.token,
      page: Number(page),
      results: total,
      payments,
      message: 'Payments fetched successfully',
    };
  }

  async getWithdrawals(query: any, req: CustomRequest) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    const {
      status,
      userId,
      bankId,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = query;
    const filter: any = {};

    if (status) filter.status = status.toLowerCase();
    if (userId) filter.user = userId;
    if (bankId) filter.bankId = bankId;

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    const withdrawals = await this.withdrawalModel
      .find(filter)
      .populate('user')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.withdrawalModel.countDocuments(filter);

    return {
      accessToken: req.token,
      page: Number(page),
      results: total,
      withdrawals,
      message: 'Withdrawals fetched successfully',
    };
  }
}
