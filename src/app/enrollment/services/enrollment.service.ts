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
  ) {}

  /**
   Enroll A Student After Payment is confirmed
   */
  async enrollStudentAfterPayment(
    dto: EnrollStudentAfterPayment,
    req: CustomRequest,
  ) {
    const { studentId, courseId, reference } = dto;
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw customError.notFound('Course not found');

    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: student.id }, course: { id: course.id } },
    });
    if (existing) return existing;

    const enrollment = this.enrollmentRepo.create({
      user: student,
      course,
      paymentReference: reference,
    });

    await this.enrollmentRepo.save(enrollment);

    await this.emailService.courseEnrollmentConfirmation(
      student.email,
      student.firstName,
      course.title,
    );
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
        course.price,
        paymentAdmins,
      );
    }

    // Notify course instructor
    await this.emailService.courseEnrollmentInstructorNotification(
      course.instructor.email,
      course.instructor.firstName,
      `${student.firstName} ${student.lastName}`,
      course.title,
    );

    return {
      enrollment,
      message: 'Lessons fetched successfully',
      accessToken: req.token,
    };
  }
}
