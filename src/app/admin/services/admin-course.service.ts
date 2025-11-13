import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '../../email/email.service';
import { UserAdmin, UserAdminDocument } from 'src/models/admin.schema';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/models/course.schema';
import { UserRole } from 'src/app/user/user.interface';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { AdminCourseActionDTO } from 'src/app/course/course.dto';
import {
  Enrollment,
  EnrollmentDocument,
} from 'src/models/enrollment.schema';
import { User, UserDocument } from 'src/models/user.schema';
import { Lesson, LessonDocument } from 'src/models/lesson.schema';

@Injectable()
export class AdminCoursesService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private emailService: EmailService,
  ) {}

  async viewCourses(query: any) {
    const { search, category, status, page = 1, limit = 10 } = query;

    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { instructorName: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await this.courseModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .exec();

    const total = await this.courseModel.countDocuments(filter);

    return {
      page: Number(page),
      total,
      courses,
      message: 'Admin courses fetched successfully',
    };
  }

  async approveCourse(
    courseId: string,
    dto: AdminCourseActionDTO,
    req: CustomRequest,
  ) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const { action, rejectReason } = dto;
    const course = await this.courseModel
      .findById(courseId)
      .populate('instructor');
    if (!course) throw customError.conflict('Course not found');
    if (course.isDeleted) throw customError.gone('Course has been deleted');

    const instructor = course.instructorId as User;
    if (!instructor.isActive) {
      throw customError.forbidden('Instructor has been suspended');
    }


    if (course.status === action) {
      throw customError.forbidden(`Course is already ${action}.`);
    }

    try {
switch (action) {
  case CourseStatus.APPROVED: {
    course.isApproved = true;
    course.status = CourseStatus.APPROVED;
    course.approvalDate = new Date();
    course.approvedBy = admin._id as any;
    course.approvedByName =
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    break;
  }

  case CourseStatus.REJECTED: {
    course.isApproved = false;
    course.status = CourseStatus.REJECTED;
    course.rejectionDate = new Date();
    course.rejectedBy = admin._id as any;
    course.rejectedByName =
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    course.rejectReason = dto.rejectReason ?? '';
    break;
  }

  case CourseStatus.SUSPENDED: {
    course.isApproved = false;
    course.status = CourseStatus.SUSPENDED;
    course.suspensionDate = new Date();
    course.suspendedBy = admin._id as any;
    course.suspendedByName =
      `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
    course.suspendReason = dto.suspendReason ?? '';
    break;
  }

  case CourseStatus.PENDING: {
    course.isApproved = false;
    course.status = CourseStatus.PENDING;
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

      admin.actions = [...(admin.actions || []), newAdminAction];
      await admin.save();
      await course.save();

 this.emailService.courseStatusEmail(
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

  async getSingleCourse(courseId: string, req: CustomRequest) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');
    const course = await this.courseModel.findById(courseId);

    if (!course) {
      throw customError.notAcceptable('Course not found');
    }

    const instructor = await this.userModel.findOne({ _id: course.instructorId });
    if (!instructor) {
      throw customError.notAcceptable('Instructor not found');
    }
    const totalInstructorCourses = await this.courseModel.countDocuments({
      instructor: instructor._id,
    });
    const totalCourseEnrollments = await this.enrollmentModel.countDocuments({
      course: course._id,
    });
    const totalInstructorEnrollments =
      await this.enrollmentModel.countDocuments({
        user: instructor._id,
      });

    // const reviewStats = await this.reviewModel.aggregate([
    //   { $match: { course: course._id } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalReviews: { $sum: 1 },
    //       avgRating: { $avg: '$rating' },
    //     },
    //   },
    // ]);

    // const totalReviews = reviewStats[0]?.totalReviews || 0;
    // const avgRating = reviewStats[0]?.avgRating?.toFixed(1) || 0;
    const lessons = await this.lessonModel
      .find({ course: course._id })
      .select('title duration position videoUrl noteUrl createdAt')
      .sort({ position: 1 })
      .lean();
    return {
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        duration: course.duration,
        coverImage: course.coverImage,
        price: course.price,
        status: course.status,
        rejectionReason: course.rejectReason,
        suspensionReason: course.suspendReason,
        instructor,
        totalCourses: totalInstructorCourses,
        enrollments: totalCourseEnrollments,
        totalInstructorEnrollments,
        // rating: avgRating,
        // totalReviews,
        lessons,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    };
  }
}
