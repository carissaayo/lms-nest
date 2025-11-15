/* eslint-disable @typescript-eslint/no-base-to-string */
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
import { ObjectId } from 'typeorm';
import { escapeRegex } from 'src/utils/utils';



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
        throw customError.badRequest('Unsupported student status transition');
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

  async viewStudents(query: any, req: CustomRequest) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const { search, status, page = 1, limit = 10 } = query;
    const filter: any = { role: 'student' };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const regex = new RegExp(safeSearch, 'i');
      filter.$or = [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
      ];
    }

    const students = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .select('firstName lastName email phoneNumber status createdAt')
      .lean();

    const total = await this.userModel.countDocuments(filter);

    const enrollmentCounts = await this.enrollmentModel.aggregate<{
      _id: ObjectId;
      totalEnrollments: number;
    }>([{ $group: { _id: '$user', totalEnrollments: { $sum: 1 } } }]);

    const paymentTotals = await this.paymentModel.aggregate<{
      _id: ObjectId;
      totalPayments: number;
    }>([{ $group: { _id: '$student', totalPayments: { $sum: '$amount' } } }]);

    const enrollmentMap = new Map<string, number>(
      enrollmentCounts.map((item) => [
        item._id.toString(),
        item.totalEnrollments,
      ]),
    );

    const paymentMap = new Map<string, number>(
      paymentTotals.map((item) => [item._id.toString(), item.totalPayments]),
    );

    const studentsWithStats = students.map((student) => {
      const studentId = String(student._id);
      return {
        _id: student._id as ObjectId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phoneNumber: student.phoneNumber,
        status: student.status,
        createdAt: student.createdAt,
        totalEnrollments: enrollmentMap.get(studentId) || 0,
        totalPayments: paymentMap.get(studentId) || 0,
      };
    });

    const [globalEnrollments, globalPayments] = await Promise.all([
      this.enrollmentModel.countDocuments(),
      this.paymentModel.aggregate<{ totalPayments: number }>([
        { $group: { _id: null, totalPayments: { $sum: '$amount' } } },
      ]),
    ]);

    const totalPaymentAmount =
      globalPayments.length > 0 ? globalPayments[0].totalPayments : 0;

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      page: Number(page),
      limit: Number(limit),
      totalStudents: total,
      totalAppEnrollments: globalEnrollments,
      totalAppPayments: totalPaymentAmount,
      students: studentsWithStats,
      message: 'Admin students fetched successfully',
    };
  }
}
