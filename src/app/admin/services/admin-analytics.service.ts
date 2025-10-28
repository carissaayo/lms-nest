import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomRequest } from 'src/utils/auth-utils';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import { EmailService } from '../../email/email.service';
import { Payment, PaymentDocument } from 'src/app/models/payment.schema';
import { customError } from 'src/libs/custom-handlers';
import {
  Withdrawal,
  WithdrawalDocument,
} from 'src/app/models/withdrawal.schema';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/app/models/course.schema';
import { User, UserDocument } from 'src/app/models/user.schema';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from 'src/app/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';

@Injectable()
export class AdminPaymentsService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Withdrawal.name)
    private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Earning.name)
    private earningModel: Model<EarningDocument>,

    private emailService: EmailService,
  ) {}

  async getAdminAnalytics(query: any) {
    const { timeRange } = query;
    let dateFilter: any = {};

    if (timeRange) {
      const now = new Date();
      let startDate: Date | null;

      switch (timeRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1month':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
          );
          break;
        case '3months':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            now.getDate(),
          );
          break;
        case '6months':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth() - 6,
            now.getDate(),
          );
          break;
        case '1year':
          startDate = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate(),
          );
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        dateFilter = { createdAt: { $gte: startDate } };
      }
    }

    // --- Overview Metrics ---
    const [
      totalCourses,
      totalStudents,
      totalInstructors,
      totalEnrollments,
      totalWithdrawals,
      totalRevenue,
      activeStudents,
      activeCourses,
    ] = await Promise.all([
      this.courseModel.countDocuments(),
      this.userModel.countDocuments({ role: 'student' }),
      this.userModel.countDocuments({ role: 'instructor' }),
      this.enrollmentModel.countDocuments(),
      this.withdrawalModel.countDocuments({ status: 'successful' }),
      this.earningModel.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.enrollmentModel.countDocuments({ status: 'active' }),
      this.courseModel.countDocuments({ status: 'approved' }),
    ]);

    const overview = {
      totalCourses,
      totalStudents,
      totalInstructors,
      totalEnrollments,
      totalWithdrawals,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeStudents,
      activeCourses,
    };

    // --- Course Status Breakdown ---
    const courseStatsAgg = await this.courseModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const courseStats = {
      published: courseStatsAgg.find((s) => s._id === 'approved')?.count || 0,
      draft: courseStatsAgg.find((s) => s._id === 'pending')?.count || 0,
      archived: courseStatsAgg.find((s) => s._id === 'rejected')?.count || 0,
      pending: courseStatsAgg.find((s) => s._id === 'suspended')?.count || 0,
    };

    // --- Growth Data (last 6 months) ---
    const growthData = await this._getGrowthData();

    // --- Revenue Data (last 6 months) ---
    const revenueData = await this._getRevenueData();

    // --- Category Distribution ---
    const categoryDistribution = await this.courseModel.aggregate([
      {
        $group: {
          _id: '$category',
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 5 },
    ]);

    // --- Top Instructors ---
    const topInstructors = await this.earningModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'instructor',
          foreignField: '_id',
          as: 'instructor',
        },
      },
      { $unwind: '$instructor' },
      {
        $group: {
          _id: '$instructor._id',
          name: {
            $first: {
              $concat: ['$instructor.firstName', ' ', '$instructor.lastName'],
            },
          },
          revenue: { $sum: '$amount' },
          students: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // --- Top Courses ---
    const topCourses = await this.enrollmentModel.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course._id',
          title: { $first: '$course.title' },
          students: { $sum: 1 },
          revenue: { $sum: '$course.price' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    // --- Engagement Metrics (mocked/averaged) ---
    const engagementMetrics = {
      avgSessionDuration: 42,
      avgCompletionRate: 68,
      avgCourseRating: 4.5,
      studentRetentionRate: Math.round((activeStudents / totalStudents) * 100),
    };

    // --- Withdrawal Summary ---
    const withdrawals = await this.withdrawalModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const successfulWithdrawals =
      withdrawals.find((w) => w._id === 'successful')?.count || 0;

    return {
      message: 'Admin analytics fetched successfully',
      analytics: {
        overview,
        courseStats,
        growthData,
        revenueData,
        categoryDistribution,
        topInstructors,
        topCourses,
        engagementMetrics,
        withdrawalSummary: {
          successful: successfulWithdrawals,
          total: totalWithdrawals,
        },
      },
    };
  }

  // ---------- Helper Methods ----------

  private async _getGrowthData() {
    const now = new Date();
    type GrowthData = {
      month: string;
      students: number;
      instructors: number;
      courses: number;
      enrollments: number;
    };

    const data: GrowthData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const [students, instructors, courses, enrollments] = await Promise.all([
        this.userModel.countDocuments({
          role: 'student',
          createdAt: { $gte: monthDate, $lt: nextMonth },
        }),
        this.userModel.countDocuments({
          role: 'instructor',
          createdAt: { $gte: monthDate, $lt: nextMonth },
        }),
        this.courseModel.countDocuments({
          createdAt: { $gte: monthDate, $lt: nextMonth },
        }),
        this.enrollmentModel.countDocuments({
          createdAt: { $gte: monthDate, $lt: nextMonth },
        }),
      ]);

      data.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        students,
        instructors,
        courses,
        enrollments,
      });
    }

    return data;
  }

  private async _getRevenueData() {
    const now = new Date();
    type GrowthData = {
      month: string;
      revenue: number;
      enrollments: number;
    };

    const data: GrowthData[] = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthEarnings = await this.earningModel.aggregate([
        {
          $match: {
            createdAt: { $gte: monthDate, $lt: nextMonth },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
            enrollments: { $sum: 1 },
          },
        },
      ]);

      data.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        revenue: monthEarnings[0]?.revenue || 0,
        enrollments: monthEarnings[0]?.enrollments || 0,
      });
    }

    return data;
  }
}
