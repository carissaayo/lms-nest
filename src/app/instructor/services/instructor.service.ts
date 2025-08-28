import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course, CourseStatus } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { EmailService } from 'src/app/email/email.service';
import { DBQuery, QueryString } from 'src/app/database/dbquery';
import { Enrollment } from 'src/app/enrollment/enrollment.entity';
import { UserRole } from 'src/app/user/user.interface';
import { Earning } from '../entities/earning.entity';

@Injectable()
export class InstructorService {
  constructor(
    // private readonly paymentService: PaymentService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    // @InjectRepository(Course)
    // private readonly courseRepo: Repository<Course>,

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
      //   relations: ['course', 'payment'],
      order: { createdAt: 'DESC' },
    });

    console.log('earnings', earnings);

    if (!earnings || earnings.length === 0) {
      return {
        // instructor: {
        //   id: instructor.id,
        //   name: `${instructor.firstName} ${instructor.lastName}`,
        //   email: instructor.email,
        // },
        totalEarnings: 0,
        // totalPlatformShare: 0,
        // earnings: [],
      };
    }

    // 3. Compute totals
    const totalEarnings = earnings.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    // const totalPlatformShare = earnings.reduce(
    //   (sum, e) => sum + Number(e.platformShare),
    //   0,
    // );

    return {
      //   instructor: {
      //     id: instructor.id,
      //     name: `${instructor.firstName} ${instructor.lastName}`,
      //     email: instructor.email,
      //   },
      totalEarnings,
      //   totalPlatformShare,
      //   earnings: earnings.map((e) => ({
      //     courseId: e.course.id,
      //     courseTitle: e.course.title,
      //     paymentReference: e.payment.reference,
      //     amount: Number(e.amount),
      //     platformShare: Number(e.platformShare),
      //     date: e.createdAt,
      //   })),
    };
  }
}
