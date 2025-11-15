import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAdmin, UserAdminDocument } from 'src/models/admin.schema';
import { Enrollment, EnrollmentDocument } from 'src/models/enrollment.schema';
import { Payment, PaymentDocument, PaymentStatus } from 'src/models/payment.schema';
import { User, UserDocument, UserStatus } from 'src/models/user.schema';
import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/admin-auth-utils';
import { TokenManager } from 'src/security/services/token-manager.service';
import { UpdateStudentStatusDTO } from '../admin.dto';



@Injectable()
export class AdminStudentsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserAdmin.name)
    private readonly adminModel: Model<UserAdminDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    private readonly tokenManager: TokenManager,
  ) {}

  /**
   * Get a single student with enrollments, payments, and stats
   */
  async getSingleStudent(id: string, req: CustomRequest) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');
    const student = await this.userModel
      .findOne({ _id: id })
      .select(
        'firstName lastName email picture status createdAt specialization',
      )
      .lean();

    if (!student) throw customError.notFound('Student not found');

    // Fetch enrollments
    const enrollments = await this.enrollmentModel
      .find({ user: student._id })
      .populate({
        path: 'course',
        select: 'title coverImage price',
      })
      .lean();

    // Fetch payment history
    const paymentHistory = await this.paymentModel
      .find({ student: student._id })
      .populate({
        path: 'course',
        select: 'title',
      })
      .select('amount status paymentMethod createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Compute stats
    const [totalEnrollments, completedCourses, totalSpent, averageProgress] =
      await Promise.all([
        this.enrollmentModel.countDocuments({ user: student._id }),
        this.enrollmentModel.countDocuments({
          user: student._id,
          status: 'completed',
        }),
        this.paymentModel.aggregate([
          { $match: { student: student._id, status: PaymentStatus.SUCCESS } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.enrollmentModel.aggregate([
          { $match: { user: student._id } },
          { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
        ]),
      ]);

    const totalSpentAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;
    const avgProgress =
      averageProgress.length > 0
        ? Math.round(averageProgress[0].avgProgress)
        : 0;

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      student: {
        ...student,
        enrollments,
        paymentHistory,
        stats: {
          totalEnrollments,
          completedCourses,
          totalSpent: totalSpentAmount,
          averageProgress: avgProgress,
        },
        joinedDate: student.createdAt,
      },
      message: 'Student details fetched successfully',
    };
  }

  async updateStudentStatus(
    studentId: string,
    dto: UpdateStudentStatusDTO,
    req: CustomRequest,
  ) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const { status, rejectReason, suspendReason } = dto;

    const student = await this.userModel.findById(studentId);
    if (!student) throw customError.notFound('Student not found');
    if (student.isDeleted)
      throw customError.badRequest('student has been deleted');

    if (student.status === status) {
      throw customError.badRequest(`student is already ${status}.`);
    }

    switch (status) {
      case UserStatus.APPROVED: {
        student.approvalDate = new Date();
        student.approvedBy = admin._id as any;
        student.approvedByName =
          `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
        student.rejectionDate = undefined;
        student.rejectedBy = undefined;
        student.rejectedByName = undefined;
        student.rejectReason = undefined;
        student.suspensionDate = undefined;
        student.suspendedBy = undefined;
        student.suspendedByName = undefined;
        student.suspendReason = undefined;
        student.status = UserStatus.APPROVED;

        break;
      }

      case UserStatus.REJECTED: {
        student.isActive = false;
        student.status = UserStatus.REJECTED;
        student.rejectionDate = new Date();
        student.rejectedBy = admin._id as any;
        student.rejectedByName =
          `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
        student.rejectReason = rejectReason ?? '';
        break;
      }

      case UserStatus.SUSPENDED: {
        student.isActive = false;
        student.status = UserStatus.SUSPENDED;
        student.suspensionDate = new Date();
        student.suspendedBy = admin._id as any;
        student.suspendedByName =
          `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
        student.suspendReason = suspendReason ?? '';
        break;
      }

      case UserStatus.PENDING: {
        student.isActive = false;
        student.status = UserStatus.PENDING;
        student.approvalDate = undefined;
        break;
      }

      default:
        throw customError.badRequest(
          'Unsupported student status transition',
        );
    }

    await student.save();

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: `Student has been ${status} successfully`,
      student,
    };
  }
}
