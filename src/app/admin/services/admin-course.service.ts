import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from '../../email/email.service';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/app/models/course.schema';
import { UserRole } from 'src/app/user/user.interface';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { AdminCourseActionDTO } from 'src/app/course/course.dto';


@Injectable()
export class AdminCoursesService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private emailService: EmailService,
  ) {}


async viewCourses(query: any) {
  const {
    search,
    category,
    status,
    page = 1,
    limit = 10,
  } = query;

  const filter: any = {};

  
  if (category && category !== "all") {
    filter.category = { $regex: category, $options: "i" };
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { instructorName: { $regex: search, $options: "i" } },
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
    message: "Admin courses fetched successfully",
  };
}


  async approveCourse(
    courseId: string,
    dto: AdminCourseActionDTO,
    req: CustomRequest,
  ) {
    if (!courseId) throw customError.notFound('courseId is required');

    const { action, rejectReason } = dto;
    const course = await this.courseModel
      .findById(courseId)
      .populate('instructorId');
    if (!course) throw customError.conflict('Course not found');
    if (course.deleted) throw customError.gone('Course has been deleted');

    const instructor = course.instructor as UserAdmin;
    if (!instructor.isActive) {
      throw customError.forbidden('Instructor has been suspended');
    }

    if (instructor.role !== UserRole.INSTRUCTOR) {
      throw customError.forbidden('Invalid instructor');
    }

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (course.status === action) {
      throw customError.forbidden(`Course is already ${action}.`);
    }

    try {
      switch (course.status) {
        case CourseStatus.APPROVED: {
          course.isApproved = true;
          course.status = CourseStatus.APPROVED;
          course.approvalDate = new Date();
          course.approvedBy = admin._id as any; // Explicitly cast to ObjectId
          course.approvedByName =
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
          break;
        }

        case CourseStatus.REJECTED: {
          course.isApproved = false;
          course.status = CourseStatus.REJECTED;
          course.rejectionDate = new Date();
          course.rejectedBy = admin._id as any; // Explicitly cast to ObjectId
          course.rejectedByName =
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
          course.rejectReason = rejectReason ?? '';
          break;
        }

        case CourseStatus.SUSPENDED: {
          course.isApproved = false;
          course.status = CourseStatus.SUSPENDED;
          course.suspensionDate = new Date();
          course.suspendedBy = admin._id as any; // Explicitly cast to ObjectId
          course.suspendedByName =
            `${admin.firstName || ''} ${admin.lastName || ''}`.trim();
          course.suspendReason = rejectReason ?? '';
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
    const admin = await this.adminModel.findById(id);
    return { admin };
  }
}
