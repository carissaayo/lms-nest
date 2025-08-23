/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { EmailService } from '../../email/email.service';

import { UserAdmin } from '../admin.entity';
import { Course, CourseStatus } from 'src/app/course/course.entity';

import { UserRole } from 'src/app/user/user.interface';

import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';

import { DBQuery, QueryString } from 'src/app/database/dbquery';
import { AdminCourseActionDTO } from 'src/app/course/course.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class AdminCoursesService {
  constructor(
    @InjectRepository(UserAdmin) private adminRepo: Repository<UserAdmin>,
    private emailService: EmailService,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async viewCourses(query: QueryString) {
    const baseQuery = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('course.lessons', 'lessons')
      .leftJoinAndSelect('lessons.assignments', 'assignments');

    const dbQuery = new DBQuery(baseQuery, 'course', query);

    dbQuery.filter().sort().limitFields().paginate();
    // ✅ Category by ID (uuid check)
    if (query.categoryId && isUUID(query.categoryId)) {
      dbQuery.query.andWhere('course.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    // ✅ Category by name (text search)
    if (query.category && !isUUID(query.category)) {
      dbQuery.query.andWhere('category.name ILIKE :categoryName', {
        categoryName: `%${query.category}%`,
      });
    }
    // Price filtering (exact or range)
    if (query.price) {
      dbQuery.query.andWhere('course.price = :price', {
        price: query.price,
      });
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

    if (query.status) {
      dbQuery.query.andWhere('course.status = :status', {
        status: query.status,
      });
    }

    const [courses, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    return {
      page: dbQuery.page,
      results: total,
      courses: courses,
      message: 'Courses fetched successfully',
    };
  }

  /**
   * Approve/reject/suspend a course
   */
  async approveCourse(
    courseId: string,
    dto: AdminCourseActionDTO,
    req: CustomRequest,
  ) {
    if (!courseId) throw customError.notFound('courseId is required');

    const { action, rejectReason } = dto;
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    if (!course) throw customError.conflict('Course not found');
    if (course.deleted) throw customError.gone('Course has been deleted');

    const instructor = course.instructor;
    if (!instructor.isActive)
      throw customError.forbidden('Instructor has been suspended');

    if (instructor.role !== UserRole.INSTRUCTOR)
      throw customError.forbidden('Invalid instructor');

    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (course.status === action) {
      throw customError.forbidden(`Course is already ${action}.`);
    }

    try {
      switch (action) {
        case CourseStatus.APPROVED: {
          course.isApproved = true;
          course.status = CourseStatus.APPROVED;
          course.approvalDate = new Date();
          course.approvedBy = admin;
          course.approvedByName =
            `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();

          course.rejectionDate = undefined;
          course.rejectedBy = undefined;
          course.rejectedByName = undefined;
          course.suspensionDate = undefined;
          course.suspendedBy = undefined;
          course.suspendedByName = undefined;
          break;
        }

        case CourseStatus.REJECTED: {
          course.isApproved = false;
          course.status = CourseStatus.REJECTED;
          course.rejectionDate = new Date();
          course.rejectedBy = admin;
          course.rejectedByName =
            `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();

          course.approvalDate = undefined;
          course.approvedBy = undefined;
          course.approvedByName = undefined;
          course.suspensionDate = undefined;
          course.suspendedBy = undefined;
          course.suspendedByName = undefined;
          break;
        }

        case CourseStatus.SUSPENDED: {
          course.isApproved = false;
          course.status = CourseStatus.SUSPENDED;
          course.suspensionDate = new Date();
          course.suspendedBy = admin;
          course.suspendedByName =
            `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim();

          course.rejectedBy = undefined;
          course.rejectedByName = undefined;
          break;
        }

        case CourseStatus.PENDING: {
          course.isApproved = false;
          course.status = CourseStatus.PENDING;

          course.approvalDate = undefined;
          course.approvedBy = undefined;
          course.approvedByName = undefined;
          course.rejectionDate = undefined;
          course.rejectedBy = undefined;
          course.rejectedByName = undefined;
          course.suspensionDate = undefined;
          course.suspendedBy = undefined;
          course.suspendedByName = undefined;
          break;
        }

        default:
          throw customError.badRequest('Unsupported course action transition');
      }

      const newAdminAction = {
        action: `${action} course ${course.id}`,
        ...(rejectReason ? { reason: rejectReason } : {}),
        date: new Date(),
      };
      admin.actions = [...(admin.actions ?? []), newAdminAction];

      await this.courseRepo.save(course);
      await this.adminRepo.save(admin);

      await this.emailService.courseStatusEmail(
        instructor.email,
        instructor.firstName,
        course.title,
        action,
        rejectReason || '',
      );

      return {
        accessToken: req.token,
        message: 'Course has been updated successfully',
        course,
      };
    } catch (error) {
      console.log('Error', error);
      throw customError.internalServerError(
        error.message || 'Internal Server Error',
        error.statusCode || 500,
      );
    }
  }

  async findAdminById(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });

    return {
      admin,
    };
  }
}
