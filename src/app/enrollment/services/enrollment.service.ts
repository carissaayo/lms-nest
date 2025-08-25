import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { Enrollment } from 'src/app/database/main.entity';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';

import { EmailService } from 'src/app/email/email.service';
import { PaymentService } from 'src/app/payment/services/payment.service.';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  /**
   * Step 1 → Student starts enrollment → Generate payment link
   */
  async requestEnrollment(courseId: string, req: CustomRequest) {
    const student = await this.userRepo.findOne({ where: { id: req.userId } });
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseRepo.findOne({
      where: { id: courseId, deleted: false },
    });
    if (!course) throw customError.notFound('Course not found');

    // Check if already enrolled
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: student.id }, course: { id: course.id } },
    });
    if (existing)
      throw customError.forbidden('Already enrolled in this course');

    try {
      const payment = await this.paymentService.initPaystackPayment(
        student.email,
        course.price,
        `${process.env.APP_URL}/payment/callback`,

        course.id,
        student.id,
      );

      const paymentLink = payment.data.authorization_url;

      await this.emailService.paymentLinkGenerated(
        student.email,
        student.firstName,
        course.title,
        course.price,
        paymentLink,
      );

      return {
        accessToken: req.token,
        message: 'Payment required',
        paymentLink,
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCode || 500,
      );
    }
  }

  /**
   * Step 2 → Called from webhook → auto-enroll student after successful payment
   */
  async confirmEnrollment(
    studentId: string,
    courseId: string,
    reference?: string,
  ) {
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw customError.notFound('Course not found');

    // Avoid duplicate enrollments
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

    // await this.emailService.courseEnrollmentConfirmation(
    //   student.email,
    //   student.firstName,
    //   course.title,
    // );

    return enrollment;
  }
}
