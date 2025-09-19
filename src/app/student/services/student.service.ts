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

    return {
      accessToken: req.token,
      message: 'Lesson has started successfully',
      progress,
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
    if (percentWatched >= 70) {
      progress.status = LessonStatus.COMPLETED;
      progress.completed = true;
    } else {
      progress.status = LessonStatus.IN_PROGRESS;
      progress.completed = false;
    }

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

    const progress = await this.lessonProgressModel.findOne({
      user: user._id,
      lesson: lessonId,
    });

    if (!progress) throw customError.notFound('Lesson progress not found');

    progress.status = LessonStatus.COMPLETED;
    progress.completed = true;
    await progress.save();

    return {
      accessToken: req.token,
      message: 'Lesson has been completed successfully',
      progress,
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
    if (category)
      courseFilter.categoryName = { $regex: category, $options: 'i' };
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
}
