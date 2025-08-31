import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bank } from '../entities/bank.entity';
import { Repository } from 'typeorm';
import { Earning } from '../entities/earning.entity';
import { User } from 'src/app/user/user.entity';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import {
  AddBankDto,
  ConfirmWithdrawDto,
  WithdrawDto,
} from '../dtos/withdrawal.dto';
import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import axios from 'axios';
import { EmailService } from 'src/app/email/email.service';
import { generateOtp } from 'src/utils/utils';
import { Withdrawal, withdrawalStatus } from '../entities/withdrawal.entity';
import { Otp } from '../entities/otp.entity';
import { DBQuery, QueryString } from 'src/app/database/dbquery';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Bank) private bankRepo: Repository<Bank>,
    @InjectRepository(Earning) private earningRepo: Repository<Earning>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Withdrawal)
    private withdrawalRepo: Repository<Withdrawal>,
    @InjectRepository(Otp)
    private otpRepo: Repository<Otp>,

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
  // Add bank account
  async addBank(dto: AddBankDto, req: CustomRequest) {
    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) throw customError.notFound('Instructor not found');

    const { data } = await this.paymentProvider.verifyBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );
    const existingBank = await this.bankRepo.find({
      where: {
        accountName: data.accountName,
        accountNumber: dto.accountNumber,
        bankCode: data.bankCode,
      },
    });

    console.log('existingBank', existingBank);

    if (existingBank.length > 0)
      throw customError.conflict('Bank already exist');
    const bank = this.bankRepo.create({
      ...dto,
      instructor,
      accountName: data.accountName,
    });
    await this.bankRepo.save(bank);

    return {
      message: 'bank added successfully',
      bank,
    };
  }

  // Get all banks
  async getBanks(instructorId: string) {
    return await this.bankRepo.find({
      where: { instructor: { id: instructorId } },
    });
  }

  // Delete bank
  async deleteBank(req: CustomRequest, bankId: string) {
    const bank = await this.bankRepo.findOne({
      where: { id: bankId, instructor: { id: req.userId } },
    });
    if (!bank) throw customError.notFound('Bank not found');
    await this.bankRepo.remove(bank);

    return {
      message: 'Bank has removed successfuully',
    };
  }

  //Request for withdrawal code
  async requestWithdrawCode(req: CustomRequest, dto: WithdrawDto) {
    const { bankId, amount } = dto;

    // Validate instructor
    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) throw customError.notFound('Instructor not found');
    console.log('instructor', instructor);

    // Validate bank
    const bank = await this.bankRepo.findOne({
      where: { id: bankId, instructor: { id: instructor.id } },
    });
    if (!bank) throw customError.notFound('Bank not found');

    // Calculate available balance
    const totalEarnings = await this.earningRepo
      .createQueryBuilder('earning')
      .select('SUM(earning.amount)', 'sum')
      .where('earning.instructor_id = :id', { id: instructor.id })
      .getRawOne();

    const availableBalance = Number(totalEarnings?.sum || 0);
    if (amount > availableBalance)
      throw customError.badRequest('Insufficient balance');

    const withdrawal = this.withdrawalRepo.create({
      user: instructor,
      amount,
      bankId,
    });
    await this.withdrawalRepo.save(withdrawal);
    const code = generateOtp('numeric', 8);
    const otp = this.otpRepo.create({
      user: instructor,
      withdrawal,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await this.otpRepo.save(otp);

    await this.emailService.withdrawalCodeNotification(
      instructor.email,
      `${instructor.firstName} ${instructor.lastName}`,
      code,
    );

    return {
      message: 'Withdrawal initiated successfully',
      accesToken: req.token,
      withdrawal,
    };
  }

  async confirmWithdrawalCode(
    req: CustomRequest,
    dto: ConfirmWithdrawDto,
    withdrawalId: string,
  ) {
    const { code } = dto;

    // Validate instructor
    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) throw customError.notFound('Instructor not found');

    const withdrawal = await this.withdrawalRepo.findOne({
      where: { id: withdrawalId, user: { id: instructor.id } },
    });

    console.log('withdrawal', withdrawal);

    if (!withdrawal) throw customError.notFound('Withdrawal not found');

    if (withdrawal.status !== withdrawalStatus.PENDING)
      throw customError.notFound('This withdrawal is no longer active');
    const record = await this.otpRepo.findOne({
      where: { withdrawal: { id: withdrawal.id }, code: code.toString() },
    });
    console.log(record);

    if (!record || record.expiresAt < new Date()) {
      throw customError.badRequest('Invalid or expired code');
    }

    if (record.consumed) {
      throw customError.badRequest('Used code');
    }

    const bank = await this.bankRepo.findOne({
      where: { id: withdrawal.bankId, instructor: { id: instructor.id } },
    });
    if (!bank) throw customError.notFound('Bank not found');

    const transferResult = await this.paymentProvider.initiateTransfer({
      accountNumber: bank.accountNumber,
      bankCode: bank.bankCode,
      amount: withdrawal.amount,
      accountName: bank.accountName,
    });
    console.log(transferResult);
    record.consumed = true;

    if (!transferResult.status) {
      withdrawal.status = withdrawalStatus.FAILED;
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
      accesToken: req.token,
    };
  }

  async getWithdrawals(query: QueryString, req: CustomRequest) {
    // 1. Validate instructor
    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });

    if (!instructor) throw customError.notFound('Instructor not found');

    // 2. Base query
    const baseQuery = this.withdrawalRepo
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.user', 'user')
      .where('user.id = :instructorId', { instructorId: instructor.id });

    // ✅ Optional: filter by status (pending, failed, successful)
    if (query.status) {
      baseQuery.andWhere('withdrawal.status = :status', {
        status: query.status.toLowerCase(),
      });
    }

    // 3. Apply DBQuery helpers
    const dbQuery = new DBQuery(baseQuery, 'withdrawal', query);

    dbQuery.filter().sort().limitFields().paginate();

    // Default sort: newest first
    if (!query.sort) {
      dbQuery.query.addOrderBy('withdrawal.createdAt', 'DESC');
    }

    // 4. Execute
    const [withdrawals, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    // 5. Response
    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      withdrawals,
      message: 'Withdrawals fetched successfully',
    };
  }
}
