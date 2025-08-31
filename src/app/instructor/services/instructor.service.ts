import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course, CourseStatus } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { EmailService } from 'src/app/email/email.service';
import { DBQuery, QueryString } from 'src/app/database/dbquery';
import { Enrollment } from 'src/app/enrollment/enrollment.entity';
import { UserRole } from 'src/app/user/user.interface';
import { Earning } from '../entities/earning.entity';
import { Withdrawal, withdrawalStatus } from '../entities/withdrawal.entity';

@Injectable()
export class InstructorService {
  constructor(
    // private readonly paymentService: PaymentService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Withdrawal)
    private withdrawalRepo: Repository<Withdrawal>,
    @InjectRepository(Earning)
    private readonly earningRepo: Repository<Earning>,

    private readonly emailService: EmailService,
  ) {}

  async getInstructorBalance(req: CustomRequest) {
    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) throw customError.notFound('Instructor not found');

    const earnings = await this.earningRepo.find({
      where: { instructor: { id: instructor.id } },

      order: { createdAt: 'DESC' },
    });

    const withdrawals = await this.withdrawalRepo.find({
      where: {
        user: { id: instructor.id },
        status: withdrawalStatus.SUCCESSFUL,
      },
      order: { createdAt: 'DESC' },
    });

    // Handle no earnings
    if (!earnings || earnings.length === 0) {
      return {
        totalEarnings: 0,
        totalWithdrawals: 0,
        availableBalance: 0,
      };
    }

    // Compute totals
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
