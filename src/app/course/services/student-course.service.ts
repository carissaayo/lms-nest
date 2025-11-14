/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from 'src/models/user.schema';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentStatus,
} from 'src/models/enrollment.schema';
import { Course, CourseDocument, CourseStatus } from 'src/models/course.schema';

import { CustomRequest } from 'src/utils/auth-utils';

import { customError } from 'src/libs/custom-handlers';

import { Lesson, LessonDocument } from 'src/models/lesson.schema';
import { TokenManager } from 'src/security/services/token-manager.service';
import {
  LessonProgress,
  LessonProgressDocument,
  LessonStatus,
} from 'src/models/lesson-progress.schema';
import { UpdateLessonProgressDTO } from 'src/app/student/student.dto';
import { GetInstructorCourseDto } from '../dtos/student-course.dto';

@Injectable()
export class StudentCourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(LessonProgress.name)
    private lessonProgressModel: Model<LessonProgressDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly tokenManager: TokenManager,
  ) {}

  async viewInstructorCourses(
    req: CustomRequest,
    dto: GetInstructorCourseDto,
    query: any,
  ) {
    const user = await this.userModel.findOne({ _id: req.userId });
    if (!user) throw customError.notFound('User not found');
    const instructor = await this.userModel.findOne({ _id: dto.instructorId });
    if (!instructor) throw customError.notFound('Instructor not found');
    const { status, title, sort, page = 1, limit = 10 } = query;

    const filter: any = {
      instructorId: instructor._id,
      isDeleted: { $ne: true },
    };

    if (status) filter.status = status;
    if (title) filter.title = { $regex: title, $options: 'i' };

    let sortOption: any = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'priceLowHigh':
        sortOption = { price: 1 };
        break;
      case 'priceHighLow':
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.courseModel.countDocuments(filter);

    return {
      page: Number(page),
      results: total,
      courses,
      message: 'Instructor courses fetched successfully',
    };
  }
  async viewCourses(query: any, req: CustomRequest) {
    const {
      category,
      price,
      minPrice,
      maxPrice,
      title,
      sort,
      page = 1,
      limit = 10,
    } = query;
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');
    const filter: any = {};

    filter.status = CourseStatus.APPROVED;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (price) filter.price = Number(price);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    let sortOption: any = {};
    switch (sort) {
      case 'popular':
        sortOption = { enrollments: -1 };
        break;
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'priceLowHigh':
        sortOption = { price: 1 };
        break;
      case 'priceHighLow':
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const courses = await this.courseModel
      .find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.courseModel.countDocuments(filter);

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      page: Number(page),
      results: total,
      courses,
      message: 'Courses fetched successfully',
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
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      page: Number(page),
      results: total,
      courses,
      message: 'Enrolled courses fetched successfully',
    };
  }

  async viewSingleEnrolledCourse(courseId: string, req: CustomRequest) {
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');
    if (course.status !== CourseStatus.APPROVED)
      throw customError.notFound('Course is not available at the moment');
    if (course.isDeleted) throw customError.notFound('Course has been deleted');

    const checkEnrollment = await this.enrollmentModel.findOne({
      course: course._id,
      user: user._id,
    });
    if (!checkEnrollment) throw customError.forbidden('Enrollment not found');

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      course,
      message: 'Course fetched successfully',
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
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Course has started successfully',
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

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Course has been completed successfully',
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
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Lesson has started successfully',
      progress,
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

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Lesson progress updated successfully',
      progress,
    };
  }

  async getSingleCourse(courseId: string, req: CustomRequest) {
    // --- Validate User ---
    const user = await this.userModel.findById(req.userId);
    if (!user) throw customError.notFound('User not found');

    // --- Validate Course ---
    const course = await this.courseModel.findById(courseId).lean(); // lean = faster + easier to shape output
    if (!course) throw customError.notFound('Course not found');
    if (course.status !== CourseStatus.APPROVED)
      throw customError.notFound('Course is not available at the moment');
    if (course.isDeleted) throw customError.notFound('Course has been deleted');

    // --- Instructor ---
    const instructor = await this.userModel.findById(course.instructorId).lean();

    // --- Lessons ---
    const lessons = await this.lessonModel
      .find({ course: courseId })
      .sort({ position: 1 })
      .lean();

    // --- Enrollments ---
    const enrollmentsCount = await this.enrollmentModel.countDocuments({
      course: courseId,
      status: EnrollmentStatus.ACTIVE,
    });

    // Check if current user is enrolled
    const userEnrollment = await this.enrollmentModel.findOne({
      user: req.userId,
      course: courseId,
      status: { $in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
    });

    const isEnrolled = !!userEnrollment;

    // --- Reviews (if reviews collection exists) ---
    const reviews: any[] = [];
    const rating = 0;
    const totalReviews = 0;

    // try {
    //   reviews = await this.reviewModel
    //     .find({ course: courseId })
    //     .populate({ path: 'user', select: 'firstName lastName picture' })
    //     .lean();

    //   totalReviews = reviews.length;
    //   rating = totalReviews
    //     ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
    //     : 0;
    // } catch (_) {
    //   // ignore if reviews model not implemented yet
    // }

    // --- Token Refresh ---
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    // --- Final Response Construction ---
    const response = {
      _id: course._id,
      title: course.title,
      description: course.description,
      coverImage: course.coverImage,
      price: course.price,
      category: course.category,
      duration: course.duration,
      level: course.level,
      language: course.language,
      requirements: course.requirements || [],
      learningOutcomes: course.learningOutcomes || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,

      instructor: instructor
        ? {
            _id: instructor._id,
            name: `${instructor.firstName} ${instructor.lastName}`,
            email: instructor.email,
            bio: instructor.bio || '',
            picture: instructor.picture || '',
          }
        : null,

      lessons: lessons.map((l) => ({
        _id: l._id,
        title: l.title,
        description: l.description || '',
        duration: l.duration ? `${l.duration} min` : '',
      })),

      enrollments: enrollmentsCount,
      rating,
      totalReviews,
      isEnrolled,

      reviews: reviews.map((rev) => ({
        _id: rev._id,
        rating: rev.rating,
        comment: rev.comment,
        createdAt: rev.createdAt,
        user: {
          name: `${rev.user?.firstName ?? ''} ${rev.user?.lastName ?? ''}`.trim(),
          avatar: rev.user?.picture,
        },
      })),
    };

    return {
      accessToken,
      refreshToken,
      course: response,
      message: 'Course fetched successfully',
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

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      message: 'Lesson has been completed successfully',
      progress,
    };
  }
}
