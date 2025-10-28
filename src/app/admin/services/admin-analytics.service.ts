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
import { Course, CourseDocument } from 'src/app/models/course.schema';
import { User, UserDocument } from 'src/app/models/user.schema';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/app/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';

@Injectable()
export class AdminAnalyticsService {
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

  async getAdminAnalytics(query: any, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('Instructor not found');

    const { timeRange } = query;
    const now = new Date();
    let startDate: Date | null = null;

    // Handle time range filter
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

    const dateFilter = startDate ? { createdAt: { $gte: startDate } } : {};

    // --- Overview Metrics (Filtered by date) ---
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
      this.courseModel.countDocuments(dateFilter),
      this.userModel.countDocuments({ role: 'student', ...dateFilter }),
      this.userModel.countDocuments({ role: 'instructor', ...dateFilter }),
      this.enrollmentModel.countDocuments(dateFilter),
      this.withdrawalModel.countDocuments({
        status: 'successful',
        ...dateFilter,
      }),
      this.earningModel.aggregate([
        { $match: { ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.enrollmentModel.countDocuments({ status: 'active', ...dateFilter }),
      this.courseModel.countDocuments({ status: 'approved', ...dateFilter }),
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

    // --- Course Status Breakdown (Filtered by date) ---
    const courseStatsAgg = await this.courseModel.aggregate([
      { $match: { ...dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const courseStats = {
      published: courseStatsAgg.find((s) => s._id === 'approved')?.count || 0,
      draft: courseStatsAgg.find((s) => s._id === 'pending')?.count || 0,
      archived: courseStatsAgg.find((s) => s._id === 'rejected')?.count || 0,
      pending: courseStatsAgg.find((s) => s._id === 'suspended')?.count || 0,
    };

    // --- Growth & Revenue Data (Dynamic by range) ---
    const growthData = await this._getGrowthData(timeRange);
    const revenueData = await this._getRevenueData(timeRange);

    // --- Category Distribution (Filtered by date) ---
    const categoryDistribution = await this.courseModel.aggregate([
      { $match: { ...dateFilter } },
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 5 },
    ]);

    // --- Top Instructors ---
    const topInstructors = await this.earningModel.aggregate([
      { $match: { ...dateFilter } },
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
      { $match: { ...dateFilter } },
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

    // --- Engagement Metrics ---
    const engagementMetrics = {
      avgSessionDuration: 42,
      avgCompletionRate: 68,
      avgCourseRating: 4.5,
      studentRetentionRate: totalStudents
        ? Math.round((activeStudents / totalStudents) * 100)
        : 0,
    };

    // --- Withdrawal Summary ---
    const withdrawals = await this.withdrawalModel.aggregate([
      { $match: { ...dateFilter } },
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

  private async _getGrowthData(timeRange?: string) {
    const now = new Date();

    // Dynamic range resolution
    let steps = 6;
    let isDaily = false;

    switch (timeRange) {
      case '7days':
        steps = 7;
        isDaily = true;
        break;
      case '1month':
        steps = 1;
        break;
      case '3months':
        steps = 3;
        break;
      case '6months':
        steps = 6;
        break;
      case '1year':
        steps = 12;
        break;
    }

    type GrowthData = {
      label: string;
      students: number;
      instructors: number;
      courses: number;
      enrollments: number;
    };

    const data: GrowthData[] = [];

    for (let i = steps - 1; i >= 0; i--) {
      const start = isDaily
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        : new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = isDaily
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
        : new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const [students, instructors, courses, enrollments] = await Promise.all([
        this.userModel.countDocuments({
          role: 'student',
          createdAt: { $gte: start, $lt: end },
        }),
        this.userModel.countDocuments({
          role: 'instructor',
          createdAt: { $gte: start, $lt: end },
        }),
        this.courseModel.countDocuments({
          createdAt: { $gte: start, $lt: end },
        }),
        this.enrollmentModel.countDocuments({
          createdAt: { $gte: start, $lt: end },
        }),
      ]);

      data.push({
        label: isDaily
          ? start.toLocaleDateString('en-US', { weekday: 'short' })
          : start.toLocaleString('default', { month: 'short' }),
        students,
        instructors,
        courses,
        enrollments,
      });
    }

    return data;
  }

  private async _getRevenueData(timeRange?: string) {
    const now = new Date();

    let steps = 6;
    let isDaily = false;

    switch (timeRange) {
      case '7days':
        steps = 7;
        isDaily = true;
        break;
      case '1month':
        steps = 1;
        break;
      case '3months':
        steps = 3;
        break;
      case '6months':
        steps = 6;
        break;
      case '1year':
        steps = 12;
        break;
    }

    type RevenueData = {
      label: string;
      revenue: number;
      enrollments: number;
    };

    const data: RevenueData[] = [];

    for (let i = steps - 1; i >= 0; i--) {
      const start = isDaily
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
        : new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = isDaily
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1)
        : new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const result = await this.earningModel.aggregate([
        { $match: { createdAt: { $gte: start, $lt: end } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$amount' },
            enrollments: { $sum: 1 },
          },
        },
      ]);

      data.push({
        label: isDaily
          ? start.toLocaleDateString('en-US', { weekday: 'short' })
          : start.toLocaleString('default', { month: 'short' }),
        revenue: result[0]?.revenue || 0,
        enrollments: result[0]?.enrollments || 0,
      });
    }

    return data;
  }
}
