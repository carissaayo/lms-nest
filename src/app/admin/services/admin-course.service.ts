import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { EmailService } from '../../email/email.service';

import { AdminStatus, UserAdmin } from '../admin.entity';
import { Course } from 'src/app/course/course.entity';

import { LoginDto, VerifyEmailDTO } from '../../auth/auth.dto';
import { AdminProfileInterface, PermissionsEnum } from '../admin.interface';
import {
  AddAnAdminDTO,
  AssignPermissionsDTO,
  PermissionsActions,
  SuspendUserDTO,
} from '../admin.dto';

import { UserRole } from 'src/app/user/user.interface';

import { CustomRequest, generateToken } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import {
  GET_ADMIN_PROFILE,
  handleFailedAuthAttempt,
} from 'src/utils/admin-auth-utils';
import { DBQuery, DBQueryCount, QueryString } from 'src/app/database/dbquery';
import { ApprovalStatus, ApproveCourseDTO } from 'src/app/course/course.dto';

@Injectable()
export class AdminCoursesService {
  constructor(
    @InjectRepository(UserAdmin) private adminRepo: Repository<UserAdmin>,
    private emailService: EmailService,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  async viewCourses(query: QueryString) {
    const fetchCourses = new DBQuery(this.courseRepo, 'course', query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    fetchCourses.query
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category');

    const courseQuery = fetchCourses.query;
    const courses = await courseQuery.getMany();
    const page = fetchCourses.page;

    const fetchCourseCount = new DBQueryCount(
      this.courseRepo,
      'course',
      query,
    ).filter();
    const totalCount = await fetchCourseCount.count();

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      instructor: course.instructor
        ? {
            id: course.instructor.id,
            firstName: course.instructor.firstName,
            lastName: course.instructor.lastName,
          }
        : null,
      category: course.category
        ? { name: course.category.name, id: course.category.id }
        : null,
    }));

    return {
      page,
      results: totalCount,
      courses: formattedCourses,
      message: 'Courses fetched successfully',
    };
  }

  /**
   * Approve or reject a course
   */
  async approveCourse(
    courseId: string,
    dto: ApproveCourseDTO,
    req: CustomRequest,
  ) {
    if (!courseId) throw customError.notFound('courseId is required');
    const { action, rejectReason } = dto;

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    if (!course) {
      throw customError.conflict('Course not found');
    }
    if (course.deleted) throw customError.gone('Course has been deleted');

    const instructor = course.instructor;
    if (!instructor.isActive)
      throw customError.forbidden('Instructor has been suspended');

    if (instructor.role !== UserRole.INSTRUCTOR)
      throw customError.forbidden('Invalid instructor');

    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');
    admin.isActive = true;

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }

    try {
      if (action === ApprovalStatus.APPROVE) {
        course.isApproved = true;
        course.approvalDate = new Date();
        course.approvedBy = admin;
        course.approvedByName = `${admin.firstName} ${admin.lastName}`;
      } else {
        course.isApproved = false;
        course.rejectionDate = new Date();
        course.rejectedBy = admin;
        course.rejectedByName = `${admin.firstName} ${admin.lastName}`;
      }
      const newAdminAction = {
        action: `${action}ed a Course  ${course.id}`,
        ...(rejectReason ? { rejectReason } : {}),
        date: new Date(),
      };
      admin.actions.push(newAdminAction);
      await this.courseRepo.save(course);
      await this.adminRepo.save(admin);

      await this.emailService.courseApprovalEmail(
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

  /**
   * : Suspend an User
   */
  async suspendAdmin(
    userId: string,
    suspendDto: SuspendUserDTO,
    req: CustomRequest,
  ) {
    const { action, suspensionReason } = suspendDto;
    if (!userId) throw customError.badRequest('UserId is required');

    if (!action) {
      throw customError.badRequest('Action is required');
    }

    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }
    const user = await this.adminRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw customError.notFound('User not found');
    try {
      const newAction = {
        action: `User is ${action}ed by ${admin.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      const newAdminAction = {
        action: `${action}ed a User  ${user.id}`,
        ...(suspensionReason ? { suspensionReason } : {}),
        date: new Date(),
      };

      user.isActive = false;
      user.actions.push(newAction);
      admin.actions.push(newAdminAction);
      this.adminRepo.save(user);
      this.adminRepo.save(admin);

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

  async assignPermission(
    userId: string,
    dto: AssignPermissionsDTO,
    req: CustomRequest,
  ) {
    if (!userId) throw customError.badRequest('UserId is required');

    const { permissions: newPermissions, action } = dto;

    if (!newPermissions) {
      throw customError.badRequest('Permission array is required');
    }

    const admin = await this.adminRepo.findOne({ where: { id: req.userId } });
    if (!admin) throw customError.notFound('Admin not found');

    if (!admin.isActive) {
      throw customError.forbidden('Your account has been suspended');
    }
    const user = await this.adminRepo.findOne({
      where: { id: userId },
    });

    if (!user) throw customError.notFound('User not found');
    // if (admin.id === user.id )
    //   throw customError.forbidden('You can not give yourself permissions');
    try {
      if (!user.permissions) {
        user.permissions = [];
      }

      let updatedPermissions: PermissionsEnum[] = [];

      if (action === PermissionsActions.ADD) {
        updatedPermissions = [
          ...new Set([...user.permissions, ...newPermissions]),
        ];
      } else if (action === PermissionsActions.REMOVE) {
        updatedPermissions = user.permissions.filter(
          (perm) => !newPermissions.includes(perm),
        );
      }

      user.permissions = updatedPermissions;
      await this.adminRepo.save(user);

      const { token, refreshToken } = await generateToken(admin, req);
      return {
        accessToken: token,
        refreshToken: refreshToken,
        message: 'Admin permissions have been updated',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }
  async login(loginDto: LoginDto, req: CustomRequest) {
    const { email, password } = loginDto;

    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw customError.unauthorized('admin not found');
    }

    try {
      const isPasswordValid = await admin.validatePassword(password);

      if (!isPasswordValid) {
        await handleFailedAuthAttempt(admin, this.adminRepo);
      }

      admin.failedAuthAttempts = 0;
      await this.adminRepo.save(admin);

      const { token, refreshToken, session } = await generateToken(admin, req);

      admin.sessions = [session];
      admin.failedSignInAttempts = 0;
      admin.nextSignInAttempt = new Date();
      await this.adminRepo.save(admin);
      const profile: AdminProfileInterface = GET_ADMIN_PROFILE(admin);

      return {
        accessToken: token,
        refreshToken: refreshToken,
        profile: profile,
        message: 'Signed In successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError('Internal Server Error', 500);
    }
  }

  /**
   *  Verify email
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDTO, req: CustomRequest) {
    const { emailCode } = verifyEmailDto;
    const trimmedEmailCode = emailCode?.trim();

    if (!trimmedEmailCode) {
      throw customError.unauthorized('Please enter the verification code');
    }

    const admin = await this.adminRepo.findOne({
      where: { id: req.userId },
    });
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

      await this.adminRepo.save(admin);

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

  async findAdminById(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });

    return {
      admin,
    };
  }
}
