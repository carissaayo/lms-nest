/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/app/models/course.schema';
import { User, UserDocument } from 'src/app/models/user.schema';
import {
  Assignment,
  AssignmentDocument,
} from 'src/app/models/assignment.schema';
import {
  Submission,
  SubmissionDocument,
} from 'src/app/models/submission.schema';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { EmailService } from 'src/app/email/email.service';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from 'src/app/models/enrollment.schema';
import { Lesson, LessonDocument } from 'src/app/models/lesson.schema';
import {
  LessonProgress,
  LessonProgressDocument,
  LessonStatus,
} from 'src/app/models/lesson-progress.schema';
import { UpdateLessonProgressDTO } from '../student.dto';
import config from 'src/app/config/config';

const appConfig = config();
@Injectable()
export class StudentService {
  constructor(
    private readonly paymentService: PaymentService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
    private readonly emailService: EmailService,
  ) {}

  async enroll(courseId: string, req: CustomRequest) {
    const student = await this.userModel.findById(req.userId);
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    const existing = await this.enrollmentModel.findOne({
      user: student._id,
      course: course._id,
    });
    if (existing) {
      throw customError.forbidden('Already enrolled in this course');
    }

    try {
      const url = appConfig.frontend_url;
      const payment = await this.paymentService.initPaystackPayment(
        student.email,
        course.price,
        url,
        course.id,
        student.id,
      );

      const paymentLink = payment.data.authorization_url;

      await this.emailService.paymentLinkGenerated(
        student.email,
        `${student.firstName} ${student.lastName}`,
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

  async handleSuccessfulPayment(
    studentId: string,
    courseId: string,
    reference: string,
  ) {
    const student = await this.userModel.findById(studentId);
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    const existing = await this.enrollmentModel.findOne({
      user: student._id,
      course: course._id,
    });
    if (existing) return existing;

    // Enrollment is handled in enrollment service
  }

  async getLessonsForStudent(courseId: string, query: any, req: CustomRequest) {
    const enrollment = await this.enrollmentModel
      .findOne({
        course: courseId,
        user: req.userId,
        status: 'active',
      })
      .populate('course');

    if (!enrollment) {
      throw customError.forbidden(
        'You must be enrolled in this course to view lessons',
      );
    }

    const { page = 1, limit = 10 } = query;
    const lessons = await this.lessonModel
      .find({ course: courseId })
      .populate('course')
      .populate('assignments')
      .sort({ position: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.lessonModel.countDocuments({ course: courseId });

    return {
      accessToken: req.token,
      page: Number(page),
      results: total,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }

  async getSingleEnrollmentForStudent(
    courseId: string,
    query: any,
    req: CustomRequest,
  ) {
    const enrollment = await this.enrollmentModel.findOne({
      course: courseId,
      user: req.userId,
      status: 'active',
    });

    if (!enrollment) {
      throw customError.forbidden(
        'You must be enrolled in this course to view it',
      );
    }

    const course = await this.courseModel.findOne({ _id: courseId });
    if (!course) {
      throw customError.forbidden('Course not found');
    }

    const { page = 1, limit = 10 } = query;
    const lessons = await this.lessonModel
      .find({ course: courseId })
      .sort({ position: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.lessonModel.countDocuments({ course: courseId });

    return {
      accessToken: req.token,
      page: Number(page),
      results: total,
      lessons,
      course,
      message: 'Course fetched successfully',
    };
  }

  async startLesson(lessonId: string, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) throw customError.notFound('Lesson not found');

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw customError.notFound('Course not found');

    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('Course is not available');
    }

    let progress = await this.lessonProgressModel.findOne({
      user: user._id,
      lesson: lessonId,
    });

    const enrollment = await this.enrollmentModel.findOne({
      user: req.userId,
      course: course._id,
    });

    if (!enrollment) throw customError.notFound('Enrollment not found');

    enrollment.status = EnrollmentStatus.ACTIVE;

    if (!progress) {
      progress = new this.lessonProgressModel({
        user: user._id,
        lesson: lessonId,
        status: LessonStatus.IN_PROGRESS,
        watchedDuration: 0,
      });
    } else {
      progress.status = LessonStatus.IN_PROGRESS;
    }

    await progress.save();
    await enrollment.save();
    return {
      accessToken: req.token,
      message: 'Lesson has started successfully',
      progress,
    };
  }

  async startCourse(courseId: string, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('Course is not available');
    }

    const enrollment = await this.enrollmentModel.findOne({
      user: req.userId,
      course: course._id,
    });

    if (!enrollment) throw customError.notFound('Enrollment not found');

    enrollment.status = EnrollmentStatus.ACTIVE;
    await enrollment.save();
    return {
      accessToken: req.token,
      message: 'Course has started successfully',
    };
  }
  async getALesson(lessonId: string, req: CustomRequest) {
    const student = await this.userModel.findById(req.userId);
    if (!student) {
      throw customError.notFound('Student not found');
    }

    const lesson = await this.lessonModel.findOne({ _id: lessonId });
    if (!lesson) throw customError.notFound('Lesson not found');
    const course = await this.courseModel.findOne({ _id: lesson.course });
    if (!course) throw customError.notFound('Course not found');

    const enrollment = await this.enrollmentModel.findOne({
      user: student._id,
      course: course._id,
    });

    if (!enrollment)
      throw customError.forbidden('You have not enrolled for the course yet');

    const nextLesson = await this.lessonModel
      .findOne({
        course: course._id,
        position: { $gt: lesson.position },
      })
      .sort({ position: 1 });

    const previousLesson = await this.lessonModel
      .findOne({
        course: course._id,
        position: { $lt: lesson.position },
      })
      .sort({ position: -1 });

    return {
      accessToken: req.token,
      lesson,
      nextLesson: nextLesson || null,
      previousLesson: previousLesson || null,
      message: 'Lesson fetched successfully',
    };
  }
  async updateProgress(
    lessonId: string,
    dto: UpdateLessonProgressDTO,
    req: CustomRequest,
  ) {
    const { videoDuration, watchedDuration } = dto;
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) throw customError.notFound('Lesson not found');

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw customError.notFound('Course not found');

    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('Course is not available');
    }

    let progress = await this.lessonProgressModel.findOne({
      user: user._id,
      lesson: lessonId,
    });

    if (!progress) {
      const started = await this.startLesson(lessonId, req);
      progress = started.progress;
    }

    progress.watchedDuration = watchedDuration;

    const percentWatched = (watchedDuration / videoDuration) * 100;
    if (percentWatched >= 90) {
      progress.status = LessonStatus.COMPLETED;
      progress.completed = true;
    } else {
      progress.status = LessonStatus.IN_PROGRESS;
      progress.completed = false;
    }
    await this.calculateCourseProgress(lesson.courseId, String(user._id));
    await progress.save();

    return {
      accessToken: req.token,
      message: 'Lesson progress updated successfully',
      progress,
    };
  }

  async completeLesson(lessonId: string, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) throw customError.notFound('Lesson not found');

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw customError.notFound('Course not found');

    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('Course is not available');
    }
    const enrollment = await this.enrollmentModel.findOne({
      user: req.userId,
      course: course._id,
    });

    if (!enrollment) throw customError.notFound('Enrollment not found');

    enrollment.status = EnrollmentStatus.COMPLETED;

    const progress = await this.lessonProgressModel.findOne({
      user: user._id,
      lesson: lessonId,
    });

    if (!progress) throw customError.notFound('Lesson progress not found');

    progress.status = LessonStatus.COMPLETED;
    progress.completed = true;
    await progress.save();
    await enrollment.save();

    return {
      accessToken: req.token,
      message: 'Lesson has been completed successfully',
      progress,
    };
  }

  async completeCourse(courseId: string, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('Course is not available');
    }
    const enrollment = await this.enrollmentModel.findOne({
      user: req.userId,
      course: course._id,
    });

    if (!enrollment) throw customError.notFound('Enrollment not found');

    enrollment.status = EnrollmentStatus.COMPLETED;
    await enrollment.save();

    return {
      accessToken: req.token,
      message: 'Course has been completed successfully',
    };
  }

  async calculateCourseProgress(courseId: string, userId: string) {
    const lessons = await this.lessonModel.find({ course: courseId });
    if (!lessons || lessons.length === 0) {
      throw customError.notFound('Course has no lessons');
    }
    const enrollment = await this.enrollmentModel.findOne({
      user: userId,
      course: courseId,
    });
    if (!enrollment) {
      throw customError.notFound('Enrollment not found');
    }
    const lessonIds = lessons.map((lesson) => lesson._id);

    // Get progress for all lessons for this user
    const userProgress = await this.lessonProgressModel.find({
      lesson: { $in: lessonIds },
      user: userId,
    });

    // Total duration of all lessons
    const totalDuration = lessons.reduce(
      (acc, lesson) => acc + (lesson.duration || 0),
      0,
    );

    // Completed duration (watchedDuration or full lesson duration if marked completed)
    const completedDuration = userProgress.reduce((acc, progress) => {
      const lesson = lessons.find(
        (l) => String(l._id) === progress.lesson.toString(),
      );
      if (!lesson) return acc;

      if (progress.completed) {
        return acc + (lesson.duration || 0);
      }

      return (
        acc + Math.min(progress.watchedDuration || 0, lesson.duration || 0)
      );
    }, 0);

    // Calculate percentage
    const percentage =
      totalDuration > 0 ? (completedDuration / totalDuration) * 100 : 0;

    enrollment.progress = percentage;
    await enrollment.save();

    return {
      totalDuration,
      completedDuration,
      percentage: Math.round(percentage),
    };
  }

  async viewEnrolledCourses(query: any, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const {
      categoryId,
      category,
      price,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = query;

    const enrollmentFilter: any = { user: user._id };
    const courseFilter: any = {};

    if (categoryId) courseFilter.categoryId = categoryId;
    if (category) courseFilter.category = { $regex: category, $options: 'i' };
    if (price) courseFilter.price = price;
    if (minPrice || maxPrice) {
      courseFilter.price = {};
      if (minPrice) courseFilter.price.$gte = Number(minPrice);
      if (maxPrice) courseFilter.price.$lte = Number(maxPrice);
    }

    const enrollments = await this.enrollmentModel
      .find(enrollmentFilter)
      .populate({
        path: 'course',
        match: courseFilter,
        // populate: [

        //   { path: 'lessons', populate: { path: 'assignments' } },
        // ],
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const courses = enrollments
      .map((enrollment) => enrollment.course)
      .filter(Boolean);
    const total = await this.enrollmentModel.countDocuments(enrollmentFilter);

    return {
      page: Number(page),
      results: total,
      courses,
      message: 'Enrolled courses fetched successfully',
    };
  }

  async analytic(req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const enrollments = await this.enrollmentModel.find({ user: req.userId });

    const totalEnrollments = await this.enrollmentModel.countDocuments({
      user: req.userId,
    });
    const activeEnrollments = await this.enrollmentModel.countDocuments({
      user: req.userId,
      status: EnrollmentStatus.ACTIVE,
    });
    const completedEnrollments = await this.enrollmentModel.countDocuments({
      user: req.userId,
      status: EnrollmentStatus.COMPLETED,
    });
    const pendingEnrollments = await this.enrollmentModel.countDocuments({
      user: req.userId,
      status: EnrollmentStatus.PENDING,
    });

    return {
      message: 'Student analytics fetched successfully',
      completedEnrollments: completedEnrollments || 0,
      activeEnrollments: activeEnrollments || 0,
      pendingEnrollments: pendingEnrollments || 0,
      totalEnrollments: totalEnrollments || 0,
    };
  }

  async getDetailedAnalytics(query: any, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const { timeRange } = query;
    let dateFilter: any = {};

    // Apply time range filter if provided
    if (timeRange) {
      const now = new Date();
      let startDate: Date | null;
      switch (timeRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
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

    // Get enrollments with date filter
    const enrollments = await this.enrollmentModel
      .find({
        user: req.userId,
        ...dateFilter,
      })
      .populate('course')
      .exec();

    // Calculate total learning hours
    let totalLearningHours = 0;
    for (const enrollment of enrollments) {
      if (enrollment.course) {
        const course = enrollment.course as any;
        const lessons = await this.lessonModel.find({ course: course._id });
        const totalCourseDuration = lessons.reduce(
          (acc, lesson) => acc + (lesson.duration || 0),
          0,
        );
        const progressPercentage = enrollment.progress || 0;
        const watchedDuration =
          (totalCourseDuration * progressPercentage) / 100;
        totalLearningHours += watchedDuration / 60;
      }
    }

    // Get completed courses count with filter
    const completedCourses = await this.enrollmentModel.countDocuments({
      user: req.userId,
      status: EnrollmentStatus.COMPLETED,
      ...dateFilter,
    });

    // Get total courses with filter
    const totalCourses = await this.enrollmentModel.countDocuments({
      user: req.userId,
      ...dateFilter,
    });

    // Calculate course completion rate
    let totalCompletionTime = 0;
    let completedCoursesWithTime = 0;

    const completedEnrollments = await this.enrollmentModel
      .find({
        user: req.userId,
        status: EnrollmentStatus.COMPLETED,
        ...dateFilter,
      })
      .populate('course')
      .exec();

    for (const enrollment of completedEnrollments) {
      if (enrollment.course && enrollment.updatedAt && enrollment.createdAt) {
        const course = enrollment.course as any;
        const lessons = await this.lessonModel.find({ course: course._id });
        const courseDurationMinutes = lessons.reduce(
          (acc, lesson) => acc + (lesson.duration || 0),
          0,
        );
        const courseDurationHours = courseDurationMinutes / 60;
        const completionTimeMs =
          enrollment.updatedAt.getTime() - enrollment.createdAt.getTime();
        const completionTimeHours = completionTimeMs / (1000 * 60 * 60);

        if (completionTimeHours > 0 && courseDurationHours > 0) {
          const rate = courseDurationHours / completionTimeHours;
          totalCompletionTime += rate;
          completedCoursesWithTime++;
        }
      }
    }

    const averageCompletionRate =
      completedCoursesWithTime > 0
        ? (totalCompletionTime / completedCoursesWithTime) * 100
        : 0;

    // Calculate learning by category
    const categoryStats = new Map<
      string,
      { count: number; learningHours: number }
    >();

    for (const enrollment of enrollments) {
      if (enrollment.course) {
        const course = enrollment.course as any;
        const category = course.category || 'Other';
        const lessons = await this.lessonModel.find({ course: course._id });
        const totalCourseDuration = lessons.reduce(
          (acc, lesson) => acc + (lesson.duration || 0),
          0,
        );
        const progressPercentage = enrollment.progress || 0;
        const watchedDuration =
          (totalCourseDuration * progressPercentage) / 100;
        const watchedHours = watchedDuration / 60;

        if (categoryStats.has(category)) {
          const existing = categoryStats.get(category)!;
          categoryStats.set(category, {
            count: existing.count + 1,
            learningHours: existing.learningHours + watchedHours,
          });
        } else {
          categoryStats.set(category, {
            count: 1,
            learningHours: watchedHours,
          });
        }
      }
    }

    const learningByCategory = Array.from(categoryStats.entries()).map(
      ([category, stats]) => ({
        name: category,
        value: Math.round(stats.learningHours * 100) / 100,
        count: stats.count,
        percentage:
          totalLearningHours > 0
            ? Math.round(
                (stats.learningHours / totalLearningHours) * 100 * 100,
              ) / 100
            : 0,
      }),
    );

    // Get latest 5 enrollments with course progress (within date filter)
    const recentEnrollments = await this.enrollmentModel
      .find({
        user: req.userId,
        ...dateFilter,
      })
      .populate('course')
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const recentCourseProgress: any = [];
    for (const enrollment of recentEnrollments) {
      if (enrollment.course) {
        const course = enrollment.course as any;
        const lessons = await this.lessonModel.find({ course: course._id });
        const totalDurationMinutes = lessons.reduce(
          (acc, lesson) => acc + (lesson.duration || 0),
          0,
        );
        const totalDurationHours =
          Math.round((totalDurationMinutes / 60) * 100) / 100;
        const progressPercentage = enrollment.progress || 0;

        recentCourseProgress.push({
          courseId: course._id,
          courseName: course.title,
          instructor: course.instructorName,
          category: course.category,
          totalDurationHours,
          progress: Math.round(progressPercentage * 100) / 100,
          status: enrollment.status,
          enrolledAt: enrollment.createdAt,
          lastUpdated: enrollment.updatedAt,
        });
      }
    } // Calculate learning progress over time (monthly breakdown)
    const getLearningProgressData = async () => {
      const progressData: any = [];
      const now = new Date();
      const monthsToShow = 12; // Show last 12 months

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonthDate = new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1,
        );

        // Get enrollments for this specific month
        const monthEnrollments = await this.enrollmentModel
          .find({
            user: req.userId,
            createdAt: {
              $gte: monthDate,
              $lt: nextMonthDate,
            },
          })
          .populate('course')
          .exec();

        // Calculate hours for this month
        let monthHours = 0;
        for (const enrollment of monthEnrollments) {
          if (enrollment.course) {
            const course = enrollment.course as any;
            const lessons = await this.lessonModel.find({ course: course._id });
            const totalCourseDuration = lessons.reduce(
              (acc, lesson) => acc + (lesson.duration || 0),
              0,
            );
            const progressPercentage = enrollment.progress || 0;
            const watchedDuration =
              (totalCourseDuration * progressPercentage) / 100;
            monthHours += watchedDuration / 60;
          }
        }

        // Get completed courses count for this month
        const monthCompletedCourses = await this.enrollmentModel.countDocuments(
          {
            user: req.userId,
            status: EnrollmentStatus.COMPLETED,
            updatedAt: {
              // Use updatedAt for completion date
              $gte: monthDate,
              $lt: nextMonthDate,
            },
          },
        );

        // Get total enrollments up to this month for cumulative courses count
        const cumulativeCourses = await this.enrollmentModel.countDocuments({
          user: req.userId,
          createdAt: { $lte: nextMonthDate },
        });

        // Calculate completion rate for this month
        const monthTotalEnrollments = monthEnrollments.length;
        const monthCompletionRate =
          monthTotalEnrollments > 0
            ? (monthCompletedCourses / monthTotalEnrollments) * 100
            : 0;

        // Get month name
        const monthName = monthDate.toLocaleDateString('en-US', {
          month: 'short',
        });

        progressData.push({
          month: monthName,
          hours: Math.round(monthHours * 100) / 100,
          courses: cumulativeCourses, // Cumulative courses
          completionRate: Math.round(monthCompletionRate * 100) / 100,
        });
      }

      return progressData;
    };

    const learningProgressData = await getLearningProgressData();

    return {
      accessToken: req.token,
      message: 'Detailed analytics fetched successfully',
      analytics: {
        totalLearningHours: Math.round(totalLearningHours * 100) / 100,
        completedCourses,
        totalCourses,
        courseCompletionRate: Math.round(averageCompletionRate * 100) / 100,
        learningByCategory,
        recentCourseProgress,
        timeRange,
        learningProgressData,
      },
    };
  }

  async getStudentPayments(req: CustomRequest) {
    const studentId = req.userId;

    // Fetch all payments and enrollments for this student
    const [payments, enrollments] = await Promise.all([
      this.paymentModel.find({ student: studentId }).populate('course').sort({ createdAt: -1 }),
      this.enrollmentModel.find({ user: studentId, status: { $in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] } }),
    ]);

    if (!payments.length) {
      return {
        summary: {
          totalSpent: 0,
          totalCourses: 0,
        },
        paymentHistory: [],
      };
    }

    // Calculate totals
    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCourses = enrollments.length;

    // Map payment data
    const paymentHistory = payments.map((p) => ({
      id: String(p._id),
      course: (p.course as any)?.title || 'Unknown Course',
      amount: p.amount,
      provider: p.provider,
      status: p.status,
      date: p.createdAt,
    }));

    return {
      summary: {
        totalSpent,
        totalCourses,
      },
      paymentHistory,
    };
  }
}
