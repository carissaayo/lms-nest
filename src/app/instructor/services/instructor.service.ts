import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/app/models/user.schema';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { EmailService } from 'src/app/email/email.service';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';
import {
  Withdrawal,
  WithdrawalDocument,
  withdrawalStatus,
} from 'src/app/models/withdrawal.schema';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Withdrawal.name)
    private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    private readonly emailService: EmailService,
  ) {}

  async getInstructorBalance(req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const earnings = await this.earningModel
      .find({ instructor: instructor._id })
      .sort({ createdAt: -1 });

    const withdrawals = await this.withdrawalModel
      .find({
        user: instructor._id,
        status: withdrawalStatus.SUCCESSFUL,
      })
      .sort({ createdAt: -1 });

    if (!earnings || earnings.length === 0) {
      return {
        totalEarnings: 0,
        totalWithdrawals: 0,
        availableBalance: 0,
      };
    }

    const totalEarnings = earnings.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const totalWithdrawals = withdrawals.reduce(
      (sum, w) => sum + Number(w.amount),
      0,
    );

    const availableBalance = totalEarnings - totalWithdrawals;

    return {
      message: 'Wallet has been fetched successfully',
      wallet: {
        availableBalance,
        totalEarnings,
        totalWithdrawals,
      },
      accessToken: req.token,
    };
  }
}
