import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { Enrollment } from 'src/app/database/main.entity';
import { Assignment } from 'src/app/assignment/assignment.entity';
import { Submission } from 'src/app/submission/submission.entity';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { EmailService } from 'src/app/email/email.service';

@Injectable()
export class StudentService {
  constructor(
    private readonly paymentService: PaymentService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,

    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    private readonly emailService:EmailService,
  ) {}

  /**
   * Enroll a student in a course
   */
  async enroll(courseId: string, req: CustomRequest) {
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
      // Paid course → create payment transaction
      const payment = await this.paymentService.initPaystackPayment(
        student.email,
        course.price,
        `${process.env.APP_URL}/payment/callback`, // handle callback
      );

            const paymentLink=payment.data.authorization_url
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
        paymentLink
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCOde || 500,
      );
    }
  }

  /**
   * Get assignments for a course (student must be enrolled)
   */
  //   async getAssignments(courseId: string, req: CustomRequest) {
  //     const enrollment = await this.enrollmentRepo.findOne({
  //       where: { user: { id: req.userId }, course: { id: courseId } },
  //       relations: ['course'],
  //     });
  //     if (!enrollment) {
  //       throw customError.forbidden('You are not enrolled in this course');
  //     }

  //     const assignments = await this.assignmentRepo.find({
  //       where: { course: { id: courseId } },
  //       relations: ['course'],
  //     });

  //     return {
  //       message: 'Assignments fetched successfully',
  //       assignments,
  //     };
  //   }

  //   /**
  //    * Submit an assignment
  //    */
  //   async submitAssignment(
  //     assignmentId: string,
  //     file: Express.Multer.File,
  //     req: CustomRequest,
  //   ) {
  //     const enrollment = await this.enrollmentRepo.findOne({
  //       where: { user: { id: req.userId } },
  //       relations: ['user', 'course'],
  //     });
  //     if (!enrollment) {
  //       throw customError.forbidden('You are not enrolled in any course');
  //     }

  //     const assignment = await this.assignmentRepo.findOne({
  //       where: { id: assignmentId },
  //       relations: ['course'],
  //     });
  //     if (!assignment) throw customError.notFound('Assignment not found');

  //     // Ensure enrollment is for the same course
  //     if (enrollment.course.id !== assignment.course.id) {
  //       throw customError.forbidden('You are not enrolled in this course');
  //     }

  //     if (!file) throw customError.badRequest('Assignment file is required');
  //     singleImageValidation(file, 'an assignment submission file');

  //     const fileUrl = await saveImageS3(file, `submissions/${req.userId}`);
  //     if (!fileUrl) throw customError.badRequest('File upload failed');

  //     const submission = this.submissionRepo.create({
  //       assignment,
  //       enrollment,
  //       fileUrl,
  //     });
  //     await this.submissionRepo.save(submission);

  //     return {
  //       message: 'Assignment submitted successfully',
  //       submission,
  //     };
  //   }
}
