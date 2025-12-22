import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TokenManager } from 'src/security/services/token-manager.service';
import { EmailService } from '../../email/email.service';
import { UserAdmin, UserAdminDocument } from 'src/models/admin.schema';

import { VerifyEmailDTO } from '../../auth/auth.dto';

import { AdminProfileInterface } from '../admin.interface';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'src/libs/custom-handlers';
import { GET_ADMIN_PROFILE } from 'src/utils/admin-auth-utils';

import { UpdateUserDTO } from 'src/app/user/user.dto';
import { singleImageValidation } from 'src/utils/file-validation';
import { deleteImageS3, saveImageS3 } from 'src/app/fileUpload/image-upload.service';
import { User, UserDocument } from 'src/models/user.schema';
import { UserRole } from 'src/app/user/user.interface';
import { Course, CourseDocument, CourseStatus } from 'src/models/course.schema';
import { Enrollment, EnrollmentDocument } from 'src/models/enrollment.schema';
import { Earning, EarningDocument } from 'src/models/earning.schema';
import { Payment, PaymentDocument, PaymentStatus } from 'src/models/payment.schema';



@Injectable()
export class AdminUserService {
  constructor(
    @InjectModel(UserAdmin.name) private adminModel: Model<UserAdminDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private enrollmentModel: Model<EnrollmentDocument>,
    @InjectModel(Earning.name)
    private earningModel: Model<EarningDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private emailService: EmailService,
    private readonly tokenManager: TokenManager,
  ) {}

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

  async updateUser(
    updateProfile: Partial<UpdateUserDTO>,
    picture: Express.Multer.File,
    req: CustomRequest,
  ) {
    console.log('updateUser');
    const allowedFields = [
      'firstName',
      'lastName',
      'phoneNumber',
      'state',
      'city',
      'country',
      'street',
      'bio',
    ];
    for (const key of Object.keys(updateProfile)) {
      if (!allowedFields.includes(key)) delete updateProfile[key];
    }

    const user = await this.adminModel.findOne({ _id: req.userId });
    if (!user) {
      throw customError.notFound('User not found');
    }

    if (picture) {
      singleImageValidation(picture, 'User picture');

      if (user.picture) {
        try {
          await deleteImageS3(user.picture);
        } catch (err) {
          console.warn('Failed to delete old cover image:', err.message);
        }
      }

      const uploadImg = await saveImageS3(picture, `images/users`);
      if (!uploadImg) {
        throw customError.badRequest('Invalid cover image');
      }
      user.picture = uploadImg;
    }

    // Update user fields
    Object.assign(user, updateProfile);

    await user.save();
    // build profile
    const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      profile,
      message: 'Profile updated successfully',
    };
  }

  async viewProfile(req: CustomRequest) {
    console.log('viewProfile');

    const user = await this.adminModel.findById(req.userId);
    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    const profile: AdminProfileInterface = GET_ADMIN_PROFILE(user);
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      user,
      req,
    );

    return {
      accessToken,
      refreshToken,
      profile,
      message: 'Profile fetched successfully',
    };
  }

  async viewUsers(query: any, req: CustomRequest) {
    const {
      search,
      role, // optional: instructor | student | all
      page = 1,
      limit = 10,
    } = query;

    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const match: any = { isDeleted: false };

    if (role && role !== 'all') {
      match.role = role;
    }

    if (search) {
      match.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await this.userModel.aggregate([
      { $match: match },

      // ---------- INSTRUCTOR COURSES ----------
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: 'instructorId',
          as: 'instructorCourses',
        },
      },

      // ---------- INSTRUCTOR EARNINGS ----------
      {
        $lookup: {
          from: 'earnings',
          localField: '_id',
          foreignField: 'instructor',
          as: 'earnings',
        },
      },

      // ---------- STUDENT PAYMENTS ----------
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'student',
          as: 'payments',
        },
      },

      // ---------- INSTRUCTOR ENROLLMENTS ----------
      {
        $lookup: {
          from: 'enrollments',
          let: { courseIds: '$instructorCourses._id' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$course', '$$courseIds'] },
              },
            },
          ],
          as: 'instructorEnrollments',
        },
      },

      // ---------- ADD FIELDS ----------
      {
        $addFields: {
          // Instructor fields
          totalCourses: {
            $cond: [
              { $eq: ['$role', UserRole.INSTRUCTOR] },
              { $size: '$instructorCourses' },
              0,
            ],
          },
          totalApprovedCourses: {
            $cond: [
              { $eq: ['$role', UserRole.INSTRUCTOR] },
              {
                $size: {
                  $filter: {
                    input: '$instructorCourses',
                    as: 'course',
                    cond: { $eq: ['$$course.isApproved', true] },
                  },
                },
              },
              0,
            ],
          },
          totalEnrollments: {
            $cond: [
              { $eq: ['$role', UserRole.INSTRUCTOR] },
              { $size: '$instructorEnrollments' }, // count students via enrollments
              { $size: '$payments' }, // student total
            ],
          },
          totalEarnings: {
            $cond: [
              { $eq: ['$role', UserRole.INSTRUCTOR] },
              { $sum: '$earnings.amount' },
              0,
            ],
          },

          // Student fields
          totalPayments: {
            $cond: [
              { $eq: ['$role', UserRole.STUDENT] },
              { $sum: '$payments.amount' },
              0,
            ],
          },
        },
      },

      // ---------- SHAPE RESPONSE ----------
      {
        $project: {
          password: 0,
          sessions: 0,
          actions: 0,
          instructorCourses: 0,
          earnings: 0,
          payments: 0,
          instructorEnrollments: 0,
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    const total = await this.userModel.countDocuments(match);
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      page: Number(page),
      limit: Number(limit),
      total,
      users,
      accessToken,
      refreshToken,
    };
  }

  async getSingleUser(id: string, req: CustomRequest) {
    const admin = await this.adminModel.findById(req.userId);
    if (!admin) throw customError.notFound('Admin not found');

    const user = await this.userModel
      .findById(id)
      .select(
        'firstName lastName email picture role status createdAt bio country phone city state specialization',
      )
      .lean();

    if (!user) throw customError.notFound('User not found');

    let payload: any = {};

    // ==========================
    // INSTRUCTOR
    // ==========================
    if (user.role === UserRole.INSTRUCTOR) {
      const courses = await this.courseModel
        .find({ instructorId: user._id, isDeleted: false })
        .select('title coverImage price enrollments rating status')
        .lean();

      const [
        totalCourses,
        totalEnrollments,
        totalRevenue,
        approvedCourses,
        pendingCourses,
      ] = await Promise.all([
        this.courseModel.countDocuments({ instructorId: user._id }),
        this.enrollmentModel.countDocuments({
          course: { $in: courses.map((c) => c._id) },
        }),
        this.earningModel.aggregate([
          { $match: { instructor: user._id } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.courseModel.countDocuments({
          instructorId: user._id,
          status: CourseStatus.APPROVED,
        }),
        this.courseModel.countDocuments({
          instructorId: user._id,
          status: CourseStatus.PENDING,
        }),
      ]);

      payload = {
        instructor: {
          ...user,
          courses,
          stats: {
            totalCourses,
            totalEnrollments,
            totalRevenue: totalRevenue[0]?.total || 0,
            approvedCourses,
            pendingCourses,
            averageRating: 4.5,
            totalReviews: 0,
          },
          joinedDate: user.createdAt,
        },
      };
    }

    // ==========================
    // STUDENT
    // ==========================
    if (user.role === UserRole.STUDENT) {
      const enrollments = await this.enrollmentModel
        .find({ user: user._id })
        .populate({
          path: 'course',
          select: 'title coverImage price',
        })
        .lean();

      const paymentHistory = await this.paymentModel
        .find({ student: user._id })
        .populate({
          path: 'course',
          select: 'title',
        })
        .select('amount status paymentMethod createdAt')
        .sort({ createdAt: -1 })
        .lean();

      const [totalEnrollments, completedCourses, totalSpent, averageProgress] =
        await Promise.all([
          this.enrollmentModel.countDocuments({ user: user._id }),
          this.enrollmentModel.countDocuments({
            user: user._id,
            status: 'completed',
          }),
          this.paymentModel.aggregate([
            { $match: { student: user._id, status: PaymentStatus.SUCCESS } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]),
          this.enrollmentModel.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
          ]),
        ]);

      payload = {
        student: {
          ...user,
          enrollments,
          paymentHistory,
          stats: {
            totalEnrollments,
            completedCourses,
            totalSpent: totalSpent[0]?.total || 0,
            averageProgress: averageProgress[0]
              ? Math.round(averageProgress[0].avgProgress)
              : 0,
          },
          joinedDate: user.createdAt,
        },
      };
    }

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      admin,
      req,
    );

    return {
      accessToken,
      refreshToken,
      ...payload,
      message: 'User details fetched successfully',
    };
  }
}
