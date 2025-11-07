import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import { Enrollment, EnrollmentDocument } from 'src/app/models/enrollment.schema';
import { Payment, PaymentDocument } from 'src/app/models/payment.schema';
import { User, UserDocument, UserStatus } from 'src/app/models/user.schema';
import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/admin-auth-utils';



@Injectable()
export class AdminStudentsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserAdmin.name) private readonly adminModel: Model<UserAdminDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Get a single student with enrollments, payments, and stats
   */
  async getSingleStudent(id: string) {
    const student = await this.userModel
      .findById(id)
      .select('-password')
      .lean();

    if (!student) throw customError.notFound('Student not found');

    // Fetch enrollments
    const enrollments = await this.enrollmentModel
      .find({ user: id })
      .populate({
        path: 'course',
        select: 'title coverImage price',
      })
      .lean();

    // Fetch payment history
    const paymentHistory = await this.paymentModel
      .find({ user: id })
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
        this.enrollmentModel.countDocuments({ user: id }),
        this.enrollmentModel.countDocuments({ user: id, status: 'completed' }),
        this.paymentModel.aggregate([
          { $match: { user: new Types.ObjectId(id), status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.enrollmentModel.aggregate([
          { $match: { user: new Types.ObjectId(id) } },
          { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
        ]),
      ]);

    const totalSpentAmount = totalSpent.length > 0 ? totalSpent[0].total : 0;
    const avgProgress =
      averageProgress.length > 0
        ? Math.round(averageProgress[0].avgProgress)
        : 0;

    return {
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

  /**
   * Update student status (Active / Suspended / Inactive)
   */
//   async updateStudentStatus(
//     studentId: string,
//     dto: { status: UserStatus; reason?: string },
//     req: CustomRequest,
//   ) {
//     const admin = await this.adminModel.findById(req.userId);
//     if (!admin) throw customError.notFound('Admin not found');

//     const { status, reason } = dto;

//     const student = await this.userModel.findById(studentId);
//     if (!student) throw customError.conflict('Student not found');
//     if (student.isDeleted) throw customError.gone('Student has been deleted');

//     if (student.status === status) {
//       throw customError.forbidden(`Student is already ${status}.`);
//     }

//     try {
//       switch (status) {
//         case UserStatus.APPROVED: {
//           student.isActive = true;
//           student.status = UserStatus.APPROVED;
//           student.suspensionDate = undefined;
//           student.suspendedBy = undefined;
//           student.suspendedByName = undefined;
//           student.suspendReason = undefined;
//           break;
//         }

//         case UserStatus.SUSPENDED: {
//           student.isActive = false;
//           student.status = UserStatus.SUSPENDED;
//           student.suspensionDate = new Date();
//           student.suspendedBy = admin._id as any;
//           student.suspendedByName =
//             `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
//           student.suspendReason = reason ?? '';
//           break;
//         }

//         case UserStatus.PENDING: {
//           student.isActive = false;
//           student.status = UserStatus.PENDING;
//           break;
//         }

//         default:
//           throw customError.badRequest('Unsupported student status transition');
//       }

//       await student.save();

//       return {
//         accessToken: req.token,
//         message: `Student has been ${status} successfully`,
//         student,
//       };
//     } catch (error) {
//       console.error('Error updating student status:', error);
//       throw customError.internalServerError(
//         error.message || 'Internal Server Error',
//         error.statusCode || 500,
//       );
//     }
//   }
}
