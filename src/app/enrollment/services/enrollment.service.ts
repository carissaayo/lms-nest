import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';

import { EmailService } from 'src/app/email/email.service';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { UserRole } from 'src/app/user/user.interface';
import { UserAdmin } from 'src/app/admin/admin.entity';
import { PermissionsEnum } from 'src/app/admin/admin.interface';
import { Enrollment } from '../enrollment.entity';
import { EnrollStudentAfterPayment } from '../enrollment.dto';
import { Payment } from 'src/app/payment/payment.entity';
import { Earning } from 'src/app/instructor/entities/earning.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserAdmin)
    private readonly adminRepo: Repository<UserAdmin>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Earning)
    private readonly earningRepo: Repository<Earning>,
  ) {}

  /**
   Enroll A Student After Payment is confirmed
   */
  async enrollStudentAfterPayment(dto, req: CustomRequest) {
    const { reference, amount } = dto.data;
    const { studentId, courseId } = dto.data.metadata;

    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });
    if (!course) throw customError.notFound('Course not found');

    // Prevent duplicate enrollment
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: student.id }, course: { id: course.id } },
    });
    if (existing) return existing;

    const newAmount = Number(amount);

    // --- 1. Save Payment ---
    const payment = this.paymentRepo.create({
      student: { id: student.id } as any,
      course: { id: course.id } as any,
      amount: newAmount,
      provider: 'paystack',
      reference,
      status: 'success',
    });
    await this.paymentRepo.save(payment);

    // --- 2. Save Enrollment ---
    const enrollment = this.enrollmentRepo.create({
      user: { id: student.id } as any,
      course: { id: course.id } as any,
      paymentReference: reference,
    });
    await this.enrollmentRepo.save(enrollment);

    // --- 3. Compute platform & instructor share ---
    const platformCut = newAmount * 0.2; // 20%
    const instructorCut = newAmount - platformCut;

    // --- 4. Save Earning
    const earning = this.earningRepo.create({
      instructor: { id: course.instructor.id } as any,
      course: { id: course.id } as any,
      payment: { id: payment.id } as any,
      amount: instructorCut,
      platformShare: platformCut,
    });
    await this.earningRepo.save(earning);

    // --- 5. Notify Student ---
    await this.emailService.courseEnrollmentConfirmation(
      student.email,
      student.firstName,
      course.title,
    );

    // --- 6. Notify Admins with payment permission ---
    const admins = await this.adminRepo.find({
      where: { role: UserRole.ADMIN },
    });
    const paymentAdmins = admins.filter((a) =>
      a.permissions?.includes(PermissionsEnum.ADMIN_PAYMENTS),
    );

    if (paymentAdmins.length > 0) {
      await this.emailService.courseEnrollmentAdminNotification(
        `${student.firstName} ${student.lastName}`,
        student.email,
        course.title,
        newAmount,
        paymentAdmins,
      );
    }

    // --- 7. Notify Instructor ---
    await this.emailService.courseEnrollmentInstructorNotification(
      course.instructor.email,
      course.instructor.firstName,
      `${student.firstName} ${student.lastName}`,
      course.title,
    );

    // --- Reload earning with relations (so it's not undefined in response) ---
    const savedEarning = await this.earningRepo.findOne({
      where: { id: earning.id },
      relations: ['instructor', 'course', 'payment'],
    });

    return {
      enrollment,
      payment,
      earning: savedEarning,
      message: 'Student successfully enrolled and payment recorded',
      accessToken: req.token,
    };
  }
}
