import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';

import { EmailService } from 'src/app/email/email.service';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { User, UserDocument } from 'src/app/models/user.schema';
import { Course, CourseDocument } from 'src/app/models/course.schema';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import { Payment, PaymentDocument } from 'src/app/models/payment.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/app/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';

import { UserRole } from 'src/app/user/user.interface';
import { PermissionsEnum } from 'src/app/admin/admin.interface';


@Injectable()
export class EnrollmentService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly emailService: EmailService,

    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserAdmin.name)
    private readonly adminModel: Model<UserAdminDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Earning.name)
    private readonly earningModel: Model<EarningDocument>,
  ) {}

  /**
   * Enroll a student after payment is confirmed
   */
  async enrollStudentAfterPayment(dto: any, req: CustomRequest) {
    const { reference } = dto.data;
    const { studentId, courseId } = dto.data.metadata;

    // --- 1. Find student ---
    const student = await this.userModel.findById(studentId);
    if (!student) throw customError.notFound('Student not found');

    // --- 2. Find course with instructor populated ---
    const course = await this.courseModel.findById(courseId);

    if (!course) throw customError.notFound('Course not found');
    const instructor = await this.userModel.findById(course.instructor);
    if (!instructor) throw customError.notFound('Instructor not found');

    // --- 3. Prevent duplicate enrollment ---
    const existing = await this.enrollmentModel.findOne({
      user: student._id,
      course: course._id,
    });
    if (existing) return existing;

    const newAmount = Number(course.price);

    // --- 4. Save Payment ---
    const payment = new this.paymentModel({
      student: student._id,
      course: course._id,
      amount: newAmount,
      provider: 'paystack',
      reference,
      status: 'success',
    });
    await payment.save();

    // --- 5. Save Enrollment ---
    const enrollment = new this.enrollmentModel({
      user: student._id,
      course: course._id,
      paymentReference: reference,
    });
    await enrollment.save();

    // --- 6. Compute platform & instructor share ---
    const platformCut = newAmount * 0.2; // 20%
    const instructorCut = newAmount - platformCut;

    // --- 7. Save Earning ---
    const earning = new this.earningModel({
      instructor: instructor._id,
      course: course._id,
      payment: payment._id,
      amount: instructorCut,
      platformShare: platformCut,
    });
    await earning.save();

    // increment the course enrollments
    course.enrollments += 1;
    await course.save();
    // --- 8. Notify Student ---
    await this.emailService.courseEnrollmentConfirmation(
      student.email,
      student.firstName,
      course.title,
    );

    // --- 9. Notify Admins with payment permission ---
    const admins = await this.adminModel.find({ role: UserRole.ADMIN });
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

    // --- 10. Notify Instructor ---

    await this.emailService.courseEnrollmentInstructorNotification(
      instructor.email,
      instructor.firstName,
      `${student.firstName} ${student.lastName}`,
      course.title,
    );

    return {
      enrollment,
      payment,
      message: 'Student successfully enrolled and payment recorded',
      accessToken: req.token,
    };
  }
}
