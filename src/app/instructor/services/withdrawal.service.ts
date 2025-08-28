import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bank } from '../entities/bank.entity';
import { Repository } from 'typeorm';
import { Earning } from '../entities/earning.entity';
import { User } from 'src/app/user/user.entity';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { AddBankDto, WithdrawDto } from '../dtos/withdrawal.dto';
import { customError } from 'libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import axios from 'axios';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Bank) private bankRepo: Repository<Bank>,
    @InjectRepository(Earning) private earningRepo: Repository<Earning>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private paymentProvider: PaymentService,
  ) {}

  async getSupportedBanks() {
    const banks = await this.paymentProvider.getNigierianBanks();

    if (!banks.isValid) {
      throw new Error(banks.message);
    }

    return banks.data; // return list of { name, code }
  }
  // Add bank account
  async addBank(dto: AddBankDto, req: CustomRequest) {
    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) throw customError.notFound('Instructor not found');
    const nigerianBanks = await this.getSupportedBanks();
    console.log(nigerianBanks);

    const result = this.paymentProvider.verifyBankAccount(
      dto.accountNumber,
      dto.bankCode,
    );
    // const bank = this.bankRepo.create({ ...dto, instructor });
    // return await this.bankRepo.save(bank);
    console.log('result', result);

    return {
      message: 'bank added successfully',
    };
  }

  // Get all banks
  async getBanks(instructorId: string) {
    return await this.bankRepo.find({
      where: { instructor: { id: instructorId } },
    });
  }

  // Delete bank
  async deleteBank(instructorId: string, bankId: string) {
    const bank = await this.bankRepo.findOne({
      where: { id: bankId, instructor: { id: instructorId } },
    });
    if (!bank) throw customError.notFound('Bank not found');
    return await this.bankRepo.remove(bank);
  }

  // Withdraw funds
  async withdraw(instructorId: string, dto: WithdrawDto) {
    const { bankId, amount } = dto;

    // Validate instructor
    const instructor = await this.userRepo.findOne({
      where: { id: instructorId },
    });
    if (!instructor) throw customError.notFound('Instructor not found');

    // Validate bank
    const bank = await this.bankRepo.findOne({
      where: { id: bankId, instructor: { id: instructorId } },
    });
    if (!bank) throw customError.notFound('Bank not found');

    // Calculate available balance
    const totalEarnings = await this.earningRepo
      .createQueryBuilder('earning')
      .select('SUM(earning.amount)', 'sum')
      .where('earning.instructor_id = :id', { id: instructorId })
      .getRawOne();

    const availableBalance = Number(totalEarnings?.sum || 0);
    if (availableBalance < amount)
      throw customError.badRequest('Insufficient balance');

    // Call Flutterwave/Paystack transfer
    // const transferResult = await this.paymentProvider.initiateTransfer({
    //   accountNumber: bank.accountNumber,
    //   bankCode: bank.bankCode,
    //   amount,
    //   accountName: bank.accountName,
    // });

    // Mark withdrawal as done (optional: create a Withdrawal entity)
    return {
      message: 'Withdrawal initiated successfully',
      //   transferResult,
    };
  }
}
