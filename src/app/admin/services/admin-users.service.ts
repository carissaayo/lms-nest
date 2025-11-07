import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { EmailService } from '../../email/email.service';
import { UserAdmin, UserAdminDocument } from 'src/app/models/admin.schema';
import { User, UserDocument } from 'src/app/models/user.schema';
import { VerifyEmailDTO } from '../../auth/auth.dto';
import { SuspendUserDTO } from '../admin.dto';
import { AdminProfileInterface } from '../admin.interface';
import { CustomRequest, generateToken } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { GET_ADMIN_PROFILE } from 'src/utils/admin-auth-utils';
import { Course, CourseDocument } from 'src/app/models/course.schema';
import { Enrollment, EnrollmentDocument } from 'src/app/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/app/models/earning.schema';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    private emailService: EmailService,
  ) {}

  async suspendUser(
    userId: string,
    suspendDto: SuspendUserDTO,
    req: CustomRequest,
  ) {
    const { action, suspensionReason } = suspendDto;
    if (!userId) throw customError.badRequest('UserId is required');

    if (!action) {
      throw customError.badRequest('Action is required');
    }

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw customError.notFound('User not found');

    try {
      const newAction = {
        action: `User is ${action}ed by ${admin.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      const newAdminAction = {
        action: `${action}ed a User ${user.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      user.isActive = false;
      user.actions = [...(user.actions || []), newAction];
      admin.actions = [...(admin.actions || []), newAdminAction];

      await user.save();
      await admin.save();

      await this.emailService.suspensionEmail(
        user.email,
        user.firstName,
        action,
        suspensionReason || '',
      );

      const { token, refreshToken } = await generateToken(admin, req);
      return {
        accessToken: token,
        refreshToken: refreshToken,
        message: 'User account has been suspended.',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) {
      throw customError.badRequest('Access Denied');
    }

    if (admin.emailVerified) {
      throw customError.badRequest('Email verified already');
    }

    if (admin.emailCode !== trimmedEmailCode) {
      throw customError.badRequest('Invalid verification code');
    }

    try {
      admin.emailVerified = true;
      admin.emailCode = null;
      await admin.save();

      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(admin);

      return {
        accessToken: req.token,
        profile,
        message: 'Email Verified Successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  async viewStudents(query: any, req: CustomRequest) {
    console.log("id",req.userId);
    
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const { search, status, page = 1, limit = 10 } = query;

    const filter: any = { role: 'student' };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .select('-password ')
      .exec();

    const total = await this.userModel.countDocuments(filter);
    const enrollmentCounts = await this.enrollmentModel.aggregate([
      { $group: { _id: '$user', totalEnrollments: { $sum: 1 } } },
    ]);

    const enrollmentMap = new Map(
      enrollmentCounts.map((item) => [
        item._id.toString(),
        item.totalEnrollments,
      ]),
    );

    const studentsWithCounts = students.map((student) => ({
      ...student,
      totalEnrollments: enrollmentMap.get(student._id as ObjectId) || 0,
    }));
    return {
      page: Number(page),
      total,
      students: studentsWithCounts,
      message: 'Admin students fetched successfully',
    };
  }

  async viewInstructors(query: any, req: CustomRequest) {
    const { search, status, page = 1, limit = 10 } = query;
     const admin = await this.adminModel.findById(req.userId);
     if (!admin) throw customError.notFound('Admin not found');


    const filter: any = { role: 'instructor' };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    
    const instructors = await this.userModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .select('firstName lastName email avatar status createdAt specialization')
      .lean();

    const total = await this.userModel.countDocuments(filter);

    
    const [activeCount, pendingCount, suspendedCount] = await Promise.all([
      this.userModel.countDocuments({ role: 'instructor', status: 'active' }),
      this.userModel.countDocuments({ role: 'instructor', status: 'pending' }),
      this.userModel.countDocuments({
        role: 'instructor',
        status: 'suspended',
      }),
    ]);

     const instructorStats = await Promise.all(
      instructors.map(async (instructor) => {
        const [coursesCount, studentsCount, earningsAgg] = await Promise.all([
          this.courseModel.countDocuments({
            instructor: instructor._id,
            deleted: false,
          }),

          this.enrollmentModel.countDocuments({
            course: {
              $in: await this.courseModel
                .find({ instructor: instructor._id })
                .distinct('_id'),
            },
          }),

          this.earningModel.aggregate([
            { $match: { instructor: instructor._id } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
          ]),
        ]);

        const totalRevenue = earningsAgg[0]?.totalRevenue || 0;

        return {
          ...instructor,
          coursesCount,
          studentsCount,
          totalRevenue,
        };
      }),
    );

    return {
      page: Number(page),
      total,
      stats: {
        totalInstructors: total,
        activeInstructors: activeCount,
        pendingInstructors: pendingCount,
        suspendedInstructors: suspendedCount,
      },
      instructors: instructorStats,
      message: 'Admin instructors fetched successfully',
    };
  }
}
