import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from 'src/app/models/user.schema';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { EmailService } from 'src/app/email/email.service';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';
import {
  Withdrawal,
  WithdrawalDocument,
  WithdrawalStatus,
} from 'src/app/models/withdrawal.schema';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/app/models/course.schema';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from 'src/app/models/enrollment.schema';
import { Lesson, LessonDocument } from 'src/app/models/lesson.schema';

@Injectable()
export class InstructorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Withdrawal.name)
    private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Lesson.name)
    private lessonModel: Model<LessonDocument>,
    private readonly emailService: EmailService,
  ) {}

  async getInstructorBalance(req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const earnings = await this.earningModel
      .find({ instructor: instructor._id })
      .sort({ createdAt: -1 });

    const withdrawals = await this.withdrawalModel
      .find({
        user: instructor._id,
        status: WithdrawalStatus.SUCCESSFUL,
      })
      .sort({ createdAt: -1 });

    if (!earnings || earnings.length === 0) {
      return {
        totalEarnings: 0,
        totalWithdrawals: 0,
        availableBalance: 0,
      };
    }

    const totalEarnings = earnings.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const totalWithdrawals = withdrawals.reduce(
      (sum, w) => sum + Number(w.amount),
      0,
    );

    const availableBalance = totalEarnings - totalWithdrawals;

    return {
      message: 'Wallet has been fetched successfully',
      wallet: {
        availableBalance,
        totalEarnings,
        totalWithdrawals,
      },
      accessToken: req.token,
    };
  }
  async getInstructorAnalytics(query: any, req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const { timeRange } = query;
    let dateFilter: any = {};

    // Apply time range filter
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
        dateFilter = {
          createdAt: { $gte: startDate },
        };
      }
    }

    // Get all instructor courses
    const allCourses = await this.courseModel.find({
      instructor: instructor._id,
      ...dateFilter,
    });

    // Course status breakdown
    const draftedCourses = allCourses.filter(
      (c) => c.status === CourseStatus.PENDING,
    ).length;
    const submittedCourses = allCourses.filter(
      (c) => c.status === CourseStatus.PENDING,
    ).length; // Assuming submitted = pending
    const publishedCourses = allCourses.filter(
      (c) => c.status === CourseStatus.APPROVED,
    ).length;
    const rejectedCourses = allCourses.filter(
      (c) => c.status === CourseStatus.REJECTED,
    ).length;
    const suspendedCourses = allCourses.filter(
      (c) => c.status === CourseStatus.SUSPENDED,
    ).length;

    // Get all enrollments for instructor's courses
    const courseIds = allCourses.map((course) => course._id);
    type PopulatedEnrollment = Omit<Enrollment, 'course' | 'user'> & {
      course: Omit<Course, '_id'> & { _id: Types.ObjectId };
      user: Omit<User, '_id'> & { _id: Types.ObjectId };
    };
    const allEnrollments = (await this.enrollmentModel
      .find({ course: { $in: courseIds } })
      .populate<{ course: Course }>('course')
      .populate<{ user: User }>('user')) as unknown as PopulatedEnrollment[];

    // Student metrics
    const totalStudents = new Set(
      allEnrollments.map((e) => e.user._id.toString()),
    ).size;
    const activeStudents = new Set(
      allEnrollments
        .filter((e) => e.status === EnrollmentStatus.ACTIVE)
        .map((e) => e.user._id.toString()),
    ).size;

    // Revenue calculations (assuming you have payment records)
    const totalRevenue = allEnrollments.reduce((sum, enrollment) => {
      return sum + (enrollment.course.price || 0);
    }, 0);

    // Top 5 selling courses
    type CourseSalesEntry = {
      courseId: string;
      courseName: string;
      enrollments: number;
      revenue: number;
      price: number;
    };
    const courseSales = new Map<string, CourseSalesEntry>();
    allEnrollments.forEach((enrollment) => {
      const courseId = enrollment.course._id.toString();
      const courseName = enrollment.course.title;
      const coursePrice = enrollment.course.price || 0;

      if (courseSales.has(courseId)) {
        const existing = courseSales.get(courseId)!;
        courseSales.set(courseId, {
          ...existing,
          enrollments: existing.enrollments + 1,
          revenue: existing.revenue + coursePrice,
        });
      } else {
        courseSales.set(courseId, {
          courseId,
          courseName,
          enrollments: 1,
          revenue: coursePrice,
          price: coursePrice,
        });
      }
    });

    const topSellingCourses = Array.from(courseSales.values())
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    // Recent 5 courses
    const recentCourses = await this.courseModel
      .find({ instructor: instructor._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const recentCoursesData = await Promise.all(
      recentCourses.map(async (course) => {
        const enrollmentCount = await this.enrollmentModel.countDocuments({
          course: course._id,
        });
        const revenue = enrollmentCount * (course.price || 0);

        return {
          courseId: course._id,
          title: course.title,
          status: course.status,
          price: course.price,
          enrollments: enrollmentCount,
          revenue,
          createdAt: course.createdAt,
          category: course.category,
        };
      }),
    );

    // Monthly revenue data for chart
    const getMonthlyRevenue = async () => {
      const revenueData: any = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1,
        );

        type PopulatedEnrollment = Omit<Enrollment, 'course' | 'user'> & {
          course: Course & { _id: Types.ObjectId };
          user: User & { _id: Types.ObjectId };
        };
        const monthEnrollments = (await this.enrollmentModel
          .find({
            course: { $in: courseIds },
            createdAt: { $gte: monthDate, $lt: nextMonthDate },
          })
          .populate<{ course: Course }>('course')
          .populate<{ user: User }>(
            'user',
          )) as unknown as PopulatedEnrollment[];

        const monthRevenue = monthEnrollments.reduce((sum, enrollment) => {
          return sum + (enrollment.course.price || 0);
        }, 0);

        const monthName = monthDate.toLocaleDateString('en-US', {
          month: 'short',
        });

        revenueData.push({
          month: monthName,
          revenue: monthRevenue,
          enrollments: monthEnrollments.length,
        });
      }

      return revenueData;
    };

    const monthlyRevenue = await getMonthlyRevenue();

    // Course performance data
    const coursePerformance = await Promise.all(
      allCourses.slice(0, 10).map(async (course) => {
        const enrollments = await this.enrollmentModel.find({
          course: course._id,
        });
        const completedEnrollments = enrollments.filter(
          (e) => e.status === EnrollmentStatus.COMPLETED,
        );
        const averageProgress =
          enrollments.length > 0
            ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
              enrollments.length
            : 0;

        return {
          courseName: course.title,
          enrollments: enrollments.length,
          completionRate:
            enrollments.length > 0
              ? (completedEnrollments.length / enrollments.length) * 100
              : 0,
          averageProgress: Math.round(averageProgress),
          revenue: enrollments.length * (course.price || 0),
        };
      }),
    );

    // Student engagement metrics
    const engagementData = await Promise.all(
      courseIds.slice(0, 5).map(async (courseId) => {
        const course = await this.courseModel.findById(courseId);
        if (!course) {
          return {
            courseName: 'Unknown',
            students: 0,
            averageWatchTime: 0,
            engagementScore: 0,
          };
        }
        const enrollments = await this.enrollmentModel.find({
          course: courseId,
        });
        const lessons = await this.lessonModel.find({ course: courseId });

        // Calculate average watch time per student
        let totalWatchTime = 0;
        for (const enrollment of enrollments) {
          const totalCourseDuration = lessons.reduce(
            (acc, lesson) => acc + (lesson.duration || 0),
            0,
          );
          const watchedDuration =
            (totalCourseDuration * (enrollment.progress || 0)) / 100;
          totalWatchTime += watchedDuration;
        }

        const averageWatchTime =
          enrollments.length > 0 ? totalWatchTime / enrollments.length : 0;

        return {
          courseName: course.title,
          students: enrollments.length,
          averageWatchTime: Math.round(averageWatchTime), // in minutes
          engagementScore: Math.min(
            100,
            Math.round(
              (averageWatchTime /
                (lessons.reduce(
                  (acc, lesson) => acc + (lesson.duration || 0),
                  0,
                ) || 1)) *
                100,
            ),
          ),
        };
      }),
    );

    return {
      accessToken: req.token,
      message: 'Instructor analytics fetched successfully',
      analytics: {
        courseStats: {
          drafted: draftedCourses,
          submitted: submittedCourses,
          published: publishedCourses,
          rejected: rejectedCourses,
          suspended: suspendedCourses,
          total: allCourses.length,
        },
        studentStats: {
          totalStudents,
          activeStudents,
          retentionRate:
            totalStudents > 0
              ? Math.round((activeStudents / totalStudents) * 100)
              : 0,
        },
        revenueStats: {
          totalRevenue,
          averageRevenuePerStudent:
            totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0,
          monthlyRevenue,
        },
        topSellingCourses,
        recentCourses: recentCoursesData,
        coursePerformance,
        engagementData,
        timeRange,
      },
    };
  }
  async getInstructorStudents(query: any, req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');

    const { search, page = 1, limit = 10 } = query;

    // Get all instructor's courses
    const courses = await this.courseModel.find({ instructor: instructor._id });
    const courseIds = courses.map((course) => course._id);

    // Find all enrollments linked to the instructor’s courses
    const enrollments = await this.enrollmentModel
      .find({ course: { $in: courseIds } })
      .populate('user', 'firstName lastName email avatar')
      .lean();

    // Build a map of unique students
    const studentMap = new Map<string, any>();

    for (const enrollment of enrollments) {
      const user = enrollment.user as User & { _id: Types.ObjectId };
      const userId = user._id.toString();

      if (!studentMap.has(userId)) {
        studentMap.set(userId, {
          id: userId,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          picture: user.picture || null,
          totalCourses: 1,
          totalProgress: enrollment.progress || 0,
        });
      } else {
        const student = studentMap.get(userId);
        student.totalCourses += 1;
        student.totalProgress += enrollment.progress || 0;
      }
    }

    // Convert to array
    let students = Array.from(studentMap.values()).map((s) => ({
      ...s,
      avgProgress:
        s.totalCourses > 0 ? Math.round(s.totalProgress / s.totalCourses) : 0,
    }));

    // Search filter (by name or email)
    if (search) {
      const regex = new RegExp(search, 'i');
      students = students.filter(
        (s) => regex.test(s.name) || regex.test(s.email),
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedStudents = students.slice(startIndex, startIndex + limit);

    return {
      message: 'Students fetched successfully',
      page: Number(page),
      totalResults: students.length,
      students: paginatedStudents,
      accessToken: req.token,
    };
  }

  async getInstructorEarnings(req: CustomRequest) {
    const instructorId = req.userId;

    const [earnings, withdrawals] = await Promise.all([
      this.earningModel.find({ instructor: instructorId }).populate('course'),
      this.withdrawalModel.find({ user: instructorId }).sort({ createdAt: -1 }),
    ]);

    if (!earnings.length) {
      return {
        summary: {
          totalEarnings: 0,
          totalWithdrawals: 0,
          availableBalance: 0,
          coursesSold: 0,
        },
        withdrawal: { availableBalance: 0 },
        chartData: Array.from({ length: 12 }, (_, i) => ({
          month: new Date(0, i).toLocaleString('default', { month: 'short' }),
          earnings: 0,
        })),
        topCourses: [],
        payouts: [],
      };
    }

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalWithdrawals = withdrawals
      .filter((w) => w.status === WithdrawalStatus.SUCCESSFUL)
      .reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalEarnings - totalWithdrawals;

    const chartMap = new Map<string, number>();
    for (const e of earnings) {
      const month = e.createdAt.toLocaleString('default', { month: 'short' });
      chartMap.set(month, (chartMap.get(month) || 0) + e.amount);
    }

    const allMonths = Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString('default', { month: 'short' }),
    );
    const chartData = allMonths.map((month) => ({
      month,
      earnings: chartMap.get(month) || 0,
    }));

    const courseMap = new Map<
      string,
      { title: string; earnings: number; enrolled: number }
    >();

    for (const e of earnings) {
      const c = e.course as any;
      if (!c) continue;
      const existing = courseMap.get(String(c._id)) || {
        title: c.title,
        earnings: 0,
        enrolled: 0,
      };
      existing.earnings += e.amount;
      courseMap.set(String(c._id), existing);
    }

    const enrollments = await this.enrollmentModel
      .find({
        status: { $in: [EnrollmentStatus.COMPLETED, EnrollmentStatus.ACTIVE] },
      })
      .populate('course');

    for (const enr of enrollments) {
      const c = enr.course as any;
      if (courseMap.has(String(c._id))) {
        const course = courseMap.get(String(c._id))!;
        course.enrolled++;
      }
    }

    const topCourses = Array.from(courseMap.values())
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5)
      .map((c) => ({
        title: c.title,
        enrolled: c.enrolled,
        earnings: c.earnings,
        growth: Math.floor(Math.random() * 20) + 5,
      }));

    const payouts = withdrawals.map((w) => ({
      id: String(w._id),
      date: w.createdAt,
      amount: w.amount,
      method: 'Bank Transfer',
      status:
        w.status === WithdrawalStatus.SUCCESSFUL ? 'Completed' : 'Pending',
    }));

    const coursesSold = courseMap.size;

    return {
      summary: {
        totalEarnings,
        totalWithdrawals,
        availableBalance,
        coursesSold,
      },
      withdrawal: { availableBalance },
      chartData,
      topCourses,
      payouts,
    };
  }
}
