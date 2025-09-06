import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Bank, BankDocument } from 'src/app/models/bank.schema';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';
import { User, UserDocument } from 'src/app/models/user.schema';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import {
  AddBankDto,
  ConfirmWithdrawDto,
  WithdrawDto,
} from '../dtos/withdrawal.dto';
import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import { EmailService } from 'src/app/email/email.service';
import { generateOtp } from 'src/utils/utils';
import {
  Withdrawal,
  WithdrawalDocument,
  withdrawalStatus,
} from 'src/app/models/withdrawal.schema';
import { Otp, OtpDocument } from 'src/app/models/otp.schema';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectModel(Bank.name) private bankModel: Model<BankDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Withdrawal.name)
    private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private paymentProvider: PaymentService,
    private readonly emailService: EmailService,
  ) {}

  async getSupportedBanks() {
    const banks = await this.paymentProvider.getNigierianBanks();
    if (!banks.isValid) {
      throw new Error(banks.message);
    }

    return {
      message: 'Banks fetched successfully',
      banks: banks.data,
    };
  }

  async addBank(dto: AddBankDto, req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const { data } = await this.paymentProvider.verifyBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );

    const existingBank = await this.bankModel.findOne({
      accountName: data.accountName,
      accountNumber: dto.accountNumber,
      bankCode: data.bankCode,
    });

    if (existingBank) throw customError.conflict('Bank already exists');

    const bank = new this.bankModel({
      ...dto,
      instructor: instructor._id,
      accountName: data.accountName,
    });
    await bank.save();

    return {
      message: 'Bank added successfully',
      bank,
    };
  }

  async getBanks(instructorId: string) {
    return await this.bankModel.find({ instructor: instructorId });
  }

  async deleteBank(req: CustomRequest, bankId: string) {
    const bank = await this.bankModel.findOne({
      _id: bankId,
      instructor: req.userId,
    });
    if (!bank) throw customError.notFound('Bank not found');

    await this.bankModel.findByIdAndDelete(bankId);
    return {
      message: 'Bank has been removed successfully',
    };
  }

  async requestWithdrawCode(req: CustomRequest, dto: WithdrawDto) {
    const { bankId, amount } = dto;

    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const bank = await this.bankModel.findOne({
      _id: bankId,
      instructor: instructor._id,
    });
    if (!bank) throw customError.notFound('Bank not found');

    const totalEarnings = await this.earningModel.aggregate([
      { $match: { instructor: instructor._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const availableBalance = totalEarnings[0]?.total || 0;
    if (amount > availableBalance) {
      throw customError.badRequest('Insufficient balance');
    }

    const withdrawal = new this.withdrawalModel({
      user: instructor._id,
      amount,
      bankId,
    });
    await withdrawal.save();

    const code = generateOtp('numeric', 8);
    const otp = new this.otpModel({
      user: instructor._id,
      withdrawal: withdrawal._id,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await otp.save();

    await this.emailService.withdrawalCodeNotification(
      instructor.email,
      `${instructor.firstName} ${instructor.lastName}`,
      code,
    );

    return {
      message: 'Withdrawal initiated successfully',
      accessToken: req.token,
      withdrawal,
    };
  }

  async confirmWithdrawalCode(
    req: CustomRequest,
    dto: ConfirmWithdrawDto,
    withdrawalId: string,
  ) {
    const { code } = dto;

    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (
      !withdrawal ||
      withdrawal.user.toString() !== instructor.id.toString()
    ) {
      throw customError.notFound('Withdrawal not found');
    }

    if (withdrawal.status !== withdrawalStatus.PENDING) {
      throw customError.notFound('This withdrawal is no longer active');
    }

    const record = await this.otpModel.findOne({
      withdrawal: withdrawal._id,
      code: code.toString(),
    });

    if (!record || record.expiresAt < new Date()) {
      throw customError.badRequest('Invalid or expired code');
    }

    if (record.consumed) {
      throw customError.badRequest('Used code');
    }

    const bank = await this.bankModel.findById(withdrawal.bankId);
    if (!bank) throw customError.notFound('Bank not found');

    const transferResult = await this.paymentProvider.initiateTransfer({
      accountNumber: bank.accountNumber,
      bankCode: bank.bankCode,
      amount: withdrawal.amount,
      accountName: bank.accountName,
    });

    record.consumed = true;

    if (!transferResult.status) {
      withdrawal.status = withdrawalStatus.FAILED;
      await withdrawal.save();
      await record.save();
      throw customError.notFound('Withdrawal failed, please try again');
    }

    withdrawal.status = withdrawalStatus.SUCCESSFUL;
    await withdrawal.save();
    await record.save();

    await this.emailService.withdrawalNotification(
      instructor.email,
      `${instructor.firstName} ${instructor.lastName}`,
      withdrawal.amount,
      bank.accountNumber,
      bank.accountName,
      code,
    );

    return {
      message: 'Withdrawal initiated successfully',
      accessToken: req.token,
    };
  }

  async getWithdrawals(query: any, req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const { status, page = 1, limit = 10 } = query;
    const filter: any = { user: instructor._id };

    if (status) filter.status = status.toLowerCase();

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
