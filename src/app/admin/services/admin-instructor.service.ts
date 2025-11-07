import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '../../email/email.service';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import { User, UserDocument, UserStatus } from 'src/app/models/user.schema';

import { Course, CourseDocument } from 'src/app/models/course.schema';
import { Enrollment, EnrollmentDocument } from 'src/app/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';
import { customError } from 'src/libs/custom-handlers';
import { UpdateInstructorStatusDTO } from '../admin.dto';
import { CustomRequest } from 'src/utils/admin-auth-utils';

@Injectable()
export class AdminInstructorService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    private emailService: EmailService,
  ) {}

  async viewInstructors(query: any) {
    const { search, status, page = 1, limit = 10 } = query;

    const filter: any = { role: 'instructor' };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Get instructors
    const instructors = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .select('firstName lastName email avatar status createdAt specialization')
      .lean();

    const total = await this.userModel.countDocuments(filter);

    // Stats for dashboard summary
    const [activeCount, pendingCount, suspendedCount] = await Promise.all([
      this.userModel.countDocuments({ role: 'instructor', status: 'active' }),
      this.userModel.countDocuments({ role: 'instructor', status: 'pending' }),
      this.userModel.countDocuments({
        role: 'instructor',
        status: 'suspended',
      }),
    ]);

    // Add course, enrollment & revenue stats for each instructor
    const instructorStats = await Promise.all(
      instructors.map(async (instructor) => {
        const [coursesCount, studentsCount, earningsAgg] = await Promise.all([
          this.courseModel.countDocuments({
            instructor: instructor._id,
            deleted: false,
          }),

          this.enrollmentModel.countDocuments({
            course: {
              $in: await this.courseModel
                .find({ instructor: instructor._id })
                .distinct('_id'),
            },
          }),

          this.earningModel.aggregate([
            { $match: { instructor: instructor._id } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
          ]),
        ]);

        const totalRevenue = earningsAgg[0]?.totalRevenue || 0;

        return {
          ...instructor,
          coursesCount,
          studentsCount,
          totalRevenue,
        };
      }),
    );

    return {
      page: Number(page),
      total,
      stats: {
        totalInstructors: total,
        activeInstructors: activeCount,
        pendingInstructors: pendingCount,
        suspendedInstructors: suspendedCount,
      },
      instructors: instructorStats,
      message: 'Admin instructors fetched successfully',
    };
  }

  async getSingleInstructor(id: string) {
    const instructor = await this.userModel
      .findById(id)
      .select('-password')
      .lean();

    if (!instructor) throw customError.notFound('Instructor not found');

    const courses = await this.courseModel
      .find({ instructor: id, deleted: false })
      .select('title coverImage price enrollments rating status')
      .lean();

    const [
      coursesCount,
      studentsCount,
      totalRevenue,
      approvedCourses,
      pendingCourses,
    ] = await Promise.all([
      this.courseModel.countDocuments({ instructor: id }),
      this.enrollmentModel.countDocuments({
        course: { $in: courses.map((c) => c._id) },
      }),
      this.earningModel.aggregate([
        { $match: { instructor: instructor._id } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.courseModel.countDocuments({ instructor: id, status: 'approved' }),
      this.courseModel.countDocuments({ instructor: id, status: 'pending' }),
    ]);

    const totalRevenueAmount =
      totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    return {
      instructor: {
        ...instructor,
        courses,
        stats: {
          totalCourses: coursesCount,
          totalStudents: studentsCount,
          totalRevenue: totalRevenueAmount,
          approvedCourses,
          pendingCourses,
          averageRating: 4.5,
          totalReviews: 0,
        },
        joinedDate: instructor.createdAt,
      },
      message: 'Instructor details fetched successfully',
    };
  }

  async updateInstructorStatus(
    instructorId: string,
    dto: UpdateInstructorStatusDTO,
    req: CustomRequest,
  ) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const { status, rejectReason, suspendReason } = dto;

    const instructor = await this.userModel.findById(instructorId);
    if (!instructor) throw customError.conflict('Instructor not found');
    if (instructor.isDeleted)
      throw customError.gone('Instructor has been deleted');

    if (instructor.status === status) {
      throw customError.forbidden(`Instructor is already ${status}.`);
    }

    try {
      switch (status) {
        case UserStatus.APPROVED: {
          instructor.approvalDate = new Date();
          instructor.approvedBy = admin._id as any;
          instructor.approvedByName =
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
          instructor.rejectionDate = undefined;
          instructor.rejectedBy = undefined;
          instructor.rejectedByName = undefined;
          instructor.rejectReason = undefined;
          instructor.suspensionDate = undefined;
          instructor.suspendedBy = undefined;
          instructor.suspendedByName = undefined;
          instructor.suspendReason = undefined;
          instructor.status = UserStatus.APPROVED;

          break;
        }

        case UserStatus.REJECTED: {
          instructor.isActive = false;
          instructor.status = UserStatus.REJECTED;
          instructor.rejectionDate = new Date();
          instructor.rejectedBy = admin._id as any;
          instructor.rejectedByName =
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
          instructor.rejectReason = rejectReason ?? '';
          break;
        }

        case UserStatus.SUSPENDED: {
          instructor.isActive = false;
          instructor.status = UserStatus.SUSPENDED;
          instructor.suspensionDate = new Date();
          instructor.suspendedBy = admin._id as any;
          instructor.suspendedByName =
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
          instructor.suspendReason = suspendReason ?? '';
          break;
        }

        case UserStatus.PENDING: {
          instructor.isActive = false;
          instructor.status = UserStatus.PENDING;
          instructor.approvalDate = undefined;
          break;
        }

        default:
          throw customError.badRequest(
            'Unsupported instructor status transition',
          );
      }

    //   // Log admin action
    //   const newAdminAction = {
    //     action: `${status} instructor ${instructor.id}`,
    //     ...(rejectReason ? { reason: rejectReason } : {}),
    //     ...(suspendReason ? { reason: suspendReason } : {}),
    //     date: new Date(),
    //   };

    //   admin.actions = [...(admin.actions || []), newAdminAction];
    //   await admin.save();
      await instructor.save();

      return {
        accessToken: req.token,
        message: `Instructor has been ${status} successfully`,
        instructor,
      };
    } catch (error) {
      console.error('Error updating instructor status:', error);
      throw customError.internalServerError(
        error.message || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }
}

