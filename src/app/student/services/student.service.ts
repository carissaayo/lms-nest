/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course, CourseStatus } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';

import { Assignment } from 'src/app/assignment/assignment.entity';
import { Submission } from 'src/app/submission/submission.entity';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { PaymentService } from 'src/app/payment/services/payment.service.';
import { EmailService } from 'src/app/email/email.service';
import { DBQuery, QueryString } from 'src/app/database/dbquery';
import { Enrollment } from 'src/app/enrollment/enrollment.entity';
import { Lesson } from 'src/app/lesson/lesson.entity';
import {
  LessonProgress,
  LessonStatus,
} from 'src/app/lesson/lesson-progress.entity';
import { UpdateLessonProgressDTO } from '../student.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class StudentService {
  constructor(
    private readonly paymentService: PaymentService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Assignment)
    private readonly assignmentRepo: Repository<Assignment>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,

    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,

    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepo: Repository<LessonProgress>,

    private readonly emailService: EmailService,
  ) {}

  /**
   * Enroll a student in a course
   */
  async enroll(courseId: string, req: CustomRequest) {
    const student = await this.userRepo.findOne({ where: { id: req.userId } });
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseRepo.findOne({
      where: { id: courseId, deleted: false },
    });
    if (!course) throw customError.notFound('Course not found');

    // Check if already enrolled
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: student.id }, course: { id: course.id } },
    });
    if (existing)
      throw customError.forbidden('Already enrolled in this course');

    try {
      const payment = await this.paymentService.initPaystackPayment(
        student.email,
        course.price,
        // `${process.env.APP_URL}/payment/callback`,
        'http://localhost:5000',
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

  /**
   * Called from webhook → auto-enroll student after successful payment
   */
  async handleSuccessfulPayment(
    studentId: string,
    courseId: string,
    reference: string,
  ) {
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw customError.notFound('Student not found');

    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw customError.notFound('Course not found');

    // Avoid duplicate enrollments
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: student.id }, course: { id: course.id } },
    });
    if (existing) return existing;

    // const enrollment = this.enrollmentRepo.create({
    //   user: student,
    //   course,
    //   paymentReference: reference,
    // });

    // await this.enrollmentRepo.save(enrollment);

    // // send enrollment confirmation email
    // await this.emailService.courseEnrollmentConfirmation(
    //   student.email,
    //   student.firstName,
    //   course.title,
    // );

    // return enrollment;
  }

  /**
   * Get all lessons in a course
   */
  async getLessonsForStudent(
    courseId: string,
    query: QueryString,
    req: CustomRequest,
  ) {
    // Check if student is enrolled in the course
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        course: { id: courseId, deleted: false },
        user: { id: req.userId },
        status: 'active',
      },
      relations: ['course'],
    });

    if (!enrollment) {
      throw customError.forbidden(
        'You must be enrolled in this course to view lessons',
      );
    }

    // Build lessons query
    const baseQuery = this.lessonRepo
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .leftJoinAndSelect('lesson.assignments', 'assignments')
      .where('course.id = :courseId', { courseId });

    const dbQuery = new DBQuery(baseQuery, 'lesson', query);

    dbQuery.filter().sort().limitFields().paginate();

    if (!query.sort) {
      dbQuery.query.addOrderBy('lesson.position', 'ASC');
    }

    const [lessons, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }
  /**
   * Start a lesson for a user
   */
  async startLesson(lessonId: string, req: CustomRequest) {
    const user = await this.userRepo.findOne({ where: { id: req.userId } });
    if (!user) throw customError.notFound('User not found');

    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw customError.notFound('Lesson not found');

    const course = await this.courseRepo.findOne({
      where: { id: lesson.courseId },
    });
    if (!course) throw customError.notFound('Course not found');
    if (course.status !== CourseStatus.APPROVED)
      throw customError.forbidden('Course is not available');

    // Check if progress already exists
    let progress = await this.lessonProgressRepo.findOne({
      where: { user: { id: user.id }, lesson: { id: lessonId } },
    });

    if (!progress) {
      progress = this.lessonProgressRepo.create({
        user,
        lesson,
        status: LessonStatus.IN_PROGRESS,
        watchedDuration: 0,
      });
    } else {
      progress.status = LessonStatus.IN_PROGRESS;
    }

    this.lessonProgressRepo.save(progress);
    return {
      accessToken: req.token,
      message: 'Lesson has started successfully',
      progress,
    };
  }

  /**
   * Update lesson progress
   * @param watchedDuration duration in seconds
   */
  async updateProgress(
    lessonId: string,
    dto: UpdateLessonProgressDTO,
    req: CustomRequest,
  ) {
    const { videoDuration, watchedDuration } = dto;
    const user = await this.userRepo.findOne({ where: { id: req.userId } });
    if (!user) throw customError.notFound('User not found');

    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw customError.notFound('Lesson not found');

    const course = await this.courseRepo.findOne({
      where: { id: lesson.courseId },
    });
    if (!course) throw customError.notFound('Course not found');
    if (course.status !== CourseStatus.APPROVED)
      throw customError.forbidden('Course is not available');
    let progress = await this.lessonProgressRepo.findOne({
      where: { user: { id: user.id }, lesson: { id: lessonId } },
    });

    if (!progress) {
      // auto-start lesson if not already started
      const { progress: startedProgress } = await this.startLesson(
        lessonId,
        req,
      );
      progress = startedProgress;
    }

    progress.watchedDuration = watchedDuration;

    // Check if completed (threshold: 70%)
    const percentWatched = (watchedDuration / videoDuration) * 100;
    if (percentWatched >= 70) {
      progress.status = LessonStatus.COMPLETED;
      progress.completed = true;
    } else {
      progress.status = LessonStatus.IN_PROGRESS;
      progress.completed = false;
    }

    this.lessonProgressRepo.save(progress);
    return {
      accessToken: req.token,
      message: 'Lesson progress updated successfully',
      progress,
    };
  }

  /**
   * Explicitly mark lesson as completed (e.g., after finishing quiz)
   */
  async completeLesson(lessonId: string, req: CustomRequest) {
    const user = await this.userRepo.findOne({ where: { id: req.userId } });
    if (!user) throw customError.notFound('User not found');

    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw customError.notFound('Lesson not found');

    const course = await this.courseRepo.findOne({
      where: { id: lesson.courseId },
    });
    if (!course) throw customError.notFound('Course not found');
    if (course.status !== CourseStatus.APPROVED)
      throw customError.forbidden('Course is not available');
    const progress = await this.lessonProgressRepo.findOne({
      where: { user: { id: user.id }, lesson: { id: lessonId } },
    });

    if (!progress) throw customError.notFound('Lesson progress not found');

    progress.status = LessonStatus.COMPLETED;
    progress.completed = true;

    this.lessonProgressRepo.save(progress);

    return {
      accessToken: req.token,
      message: 'Lesson has been completed successfully',
      progress,
    };
  }

  /**
   * Get all courses a student is enrolled in
   */
  async viewEnrolledCourses(query: QueryString, req: CustomRequest) {
    const user = await this.userRepo.findOne({ where: { id: req.userId } });
    if (!user) throw customError.notFound('User not found');

    const baseQuery = this.courseRepo
      .createQueryBuilder('course')
      .innerJoin('course.enrollments', 'enrollment')
      .where('enrollment.user_id = :userId', { userId: user.id })
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.lessons', 'lessons')
      .leftJoinAndSelect('lessons.assignments', 'assignments');

    const dbQuery = new DBQuery(baseQuery, 'course', query);

    dbQuery.filter().sort().limitFields().paginate();

    // ✅ Filter by category ID
    if (query.categoryId && isUUID(query.categoryId)) {
      dbQuery.query.andWhere('course.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    // ✅ Filter by category name
    if (query.category && !isUUID(query.category)) {
      dbQuery.query.andWhere('category.name ILIKE :categoryName', {
        categoryName: `%${query.category}%`,
      });
    }

    // ✅ Price filtering (rare for enrolled, but still possible)
    if (query.price) {
      dbQuery.query.andWhere('course.price = :price', { price: query.price });
    }
    if (query.minPrice) {
      dbQuery.query.andWhere('course.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    if (query.maxPrice) {
      dbQuery.query.andWhere('course.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    const [courses, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    return {
      page: dbQuery.page,
      results: total,
      courses,
      message: 'Enrolled courses fetched successfully',
    };
  }
}
