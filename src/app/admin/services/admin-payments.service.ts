import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomRequest } from 'src/utils/auth-utils';
import { UserAdmin } from '../admin.entity';
import { EmailService } from '../../email/email.service';

import { DBQuery, QueryString } from 'src/app/database/dbquery';
import { Payment } from 'src/app/payment/payment.entity';
import { customError } from 'src/libs/custom-handlers';
import { Withdrawal } from 'src/app/instructor/entities/withdrawal.entity';

@Injectable()
export class AdminPaymentsService {
  constructor(
    @InjectRepository(UserAdmin) private adminRepo: Repository<UserAdmin>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    private emailService: EmailService,
    @InjectRepository(Withdrawal)
    private withdrawalRepo: Repository<Withdrawal>,
  ) {}

  async getPayments(query: QueryString, req: CustomRequest) {
    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    const baseQuery = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('payment.course', 'course');

    if (query.status) {
      baseQuery.andWhere('payment.status = :status', {
        status: query.status.toLowerCase(),
      });
    }

    if (query.provider) {
      baseQuery.andWhere('payment.provider = :provider', {
        provider: query.provider.toLowerCase(),
      });
    }

    if (query.courseId) {
      baseQuery.andWhere('course.id = :courseId', {
        courseId: query.courseId,
      });
    }

    if (query.studentId) {
      baseQuery.andWhere('student.id = :studentId', {
        studentId: query.studentId,
      });
    }

    // 3. Apply DBQuery helpers
    const dbQuery = new DBQuery(baseQuery, 'payment', query);

    dbQuery.filter().sort().limitFields().paginate();

    // Default sort: newest first
    if (!query.sort) {
      dbQuery.query.addOrderBy('payment.createdAt', 'DESC');
    }

    // 4. Execute
    const [payments, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    // 5. Response
    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      payments,
      message: 'Payments fetched successfully',
    };
  }

  async getWithdrawals(query: QueryString, req: CustomRequest) {
    // 1. Check admin
    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    // 2. Base query
    const baseQuery = this.withdrawalRepo
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.user', 'user');

    // 3. Filters
    if (query.status) {
      baseQuery.andWhere('withdrawal.status = :status', {
        status: query.status.toLowerCase(),
      });
    }

    if (query.userId) {
      baseQuery.andWhere('user.id = :userId', {
        userId: query.userId,
      });
    }

    if (query.bankId) {
      baseQuery.andWhere('withdrawal.bankId = :bankId', {
        bankId: query.bankId,
      });
    }

    if (query.minAmount) {
      baseQuery.andWhere('withdrawal.amount >= :minAmount', {
        minAmount: query.minAmount,
      });
    }

    if (query.maxAmount) {
      baseQuery.andWhere('withdrawal.amount <= :maxAmount', {
        maxAmount: query.maxAmount,
      });
    }

    // 4. Apply DBQuery helpers
    const dbQuery = new DBQuery(baseQuery, 'withdrawal', query);

    dbQuery.filter().sort().limitFields().paginate();

    // Default sort: newest first
    if (!query.sort) {
      dbQuery.query.addOrderBy('withdrawal.createdAt', 'DESC');
    }

    // 5. Execute
    const [withdrawals, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    // 6. Response
    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      withdrawals,
      message: 'Withdrawals fetched successfully',
    };
  }
}
