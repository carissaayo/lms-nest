/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailService } from 'src/app/email/email.service';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/models/course.schema';
import { User, UserDocument } from 'src/models/user.schema';

import { CreateCourseDTO } from '../course.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { singleImageValidation } from 'src/utils/file-validation';
import {
  deleteImageS3,
  saveImageS3,
} from 'src/app/fileUpload/image-upload.service';
import { customError } from 'src/libs/custom-handlers';

import { Lesson, LessonDocument } from 'src/models/lesson.schema';
import { TokenManager } from 'src/security/services/token-manager.service';
import { CourseCategory } from '../course.interface';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly tokenManager: TokenManager,

    private readonly emailService: EmailService,
  ) {}

  async createCourse(
    createCourseDto: CreateCourseDTO,
    coverImage: Express.Multer.File,
    req: CustomRequest,
  ) {
    if (!createCourseDto) {
      throw customError.badRequest('body is missing');
    }

    const { title, description, category, price } = createCourseDto;

    if (!coverImage) {
      throw customError.badRequest('coverImage is required');
    }
    if (!category) {
      throw customError.badRequest('category is required');
    }
   
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    singleImageValidation(coverImage, 'a cover image for the course');

    const uploadImg = await saveImageS3(coverImage, `images/courses`);
    if (!uploadImg) {
      throw customError.badRequest('Invalid cover Image');
    }

    const course = new this.courseModel({
      title,
      description,
      category: category,
      price,
      instructor: instructor._id,
      coverImage: uploadImg,
      instructorId: instructor.id,
      categoryId: category,
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
    });

    await course.save();

    await this.emailService.courseCreation(
      instructor.email,
      instructor.firstName,
      course.title,
    );
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      instructor,
      req,
    );

    return {
      accessToken,
      refreshToken,
      course,
      message: 'Course created successfully',
    };
  }

  async updateCourse(
    courseId: string,
    updateCourseDto: Partial<CreateCourseDTO>,
    coverImage: Express.Multer.File,
    req: CustomRequest,
  ) {
    if (!updateCourseDto && !coverImage) {
      throw customError.badRequest('No update data provided');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }
    const instructorId = course.instructorId.toString();
    if (instructorId !== req.userId) {
      throw customError.forbidden('You can only update your course');
    }

    const instructor = await this.userModel.findById(course.instructorId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    const { title, description, category, price } = updateCourseDto || {};

    if (category) {
      course.category = category;
    }

    if (coverImage) {
      singleImageValidation(coverImage, 'a cover image for the course');

      if (course.coverImage) {
        try {
          await deleteImageS3(course.coverImage);
        } catch (err) {
          console.warn('Failed to delete old cover image:', err.message);
        }
      }

      const uploadImg = await saveImageS3(coverImage, `images/courses`);
      if (!uploadImg) {
        throw customError.badRequest('Invalid cover image');
      }
      course.coverImage = uploadImg;
    }

    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (course.isSubmitted) course.isSubmitted = false;
    if (course.submittedAt) course.submittedAt = undefined;
    course.status = CourseStatus.PENDING;

    await course.save();

    await this.emailService.courseUpdating(
      instructor.email,
      instructor.firstName,
      course.title,
    );

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      instructor,
      req,
    );

    return {
      accessToken,
      refreshToken,
      course,
      message: 'Course updated successfully',
    };
  }

  async viewCourses(query: any,) {
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

   

    return {
      page: Number(page),
      results: total,
      courses,
      message: 'Courses fetched successfully',
    };
  }

  async deleteCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }
    const instructor = await this.userModel.findById(course.instructorId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden('You can only delete your courses');
    }

    course.isDeleted = true;
    await course.save();

    await this.emailService.courseDeletion(
      instructor.email,
      instructor.firstName,
      course.title,
    );

    return {
      message: 'Course deleted successfully',
    };
  }

  async submitCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }
    const instructor = await this.userModel.findById(course.instructorId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    if (course.isDeleted) throw customError.notFound('Course has been deleted');
    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden('You can only submit your courses');
    }
    if (course.isSubmitted) {
      throw customError.forbidden('This course has already been submitted');
    }
    if (course.status !== CourseStatus.PENDING) {
      throw customError.forbidden('This course cannot be submitted');
    }
    const lessons = await this.lessonModel.find({ course: courseId });

    if (!lessons || lessons.length === 0) {
      throw customError.notFound('Course needs to have at least one lesson');
    }

    const totalDuration = lessons.reduce(
      (acc, lesson) => acc + (lesson.duration || 0),
      0,
    );

    try {
      course.isSubmitted = true;
      course.submittedAt = new Date();
      course.duration = totalDuration;
      course.lessons = lessons.length;
      await course.save();

      this.emailService.courseSubmission(
        instructor.email,
        instructor.firstName,
        course.title,
      );

     const { accessToken, refreshToken } = await this.tokenManager.signTokens(
       instructor,
       req,
     );

     return {
       accessToken,
       refreshToken,
       message: 'Course submitted successfully',
       course,
     };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Internal Server Error');
    }
  }

  async publishCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }

    if (course.isDeleted) throw customError.notFound('Course has been deleted');

    const instructor = await this.userModel.findById(course.instructorId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden('You can only publish your courses');
    }
    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('This course has to be approved first');
    }

    try {
      course.isPublished = true;
      course.publishedAt = new Date();
      await course.save();

      this.emailService.coursePublish(
        instructor.email,
        instructor.firstName,
        course.title,
      );
 const { accessToken, refreshToken } = await this.tokenManager.signTokens(
   instructor,
   req,
 );

 return {
   accessToken,
   refreshToken,
   message: 'Course published successfully',
   course,
 };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Internal Server Error');
    }
  }

  async getSingleCourse(courseId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');
    if (course.status !== CourseStatus.APPROVED)
      throw customError.notFound('Course is not available at the moment');
    if (course.isDeleted) throw customError.notFound('Course has been deleted');

    return {
      course,
      message: 'Course fetched successfully',
    };
  }

  async viewCourseForInstructor(courseId: string, req: CustomRequest) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');
    if (course.isDeleted) throw customError.notFound('Course has been deleted');

    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden('You can only view your own courses');
    }

    return {
      course,
      message: 'Course fetched successfully',
    };
  }

  async viewInstructorCourses(req: CustomRequest, query: any) {
    const { status, title, sort, page = 1, limit = 10 } = query;

    const filter: any = {
      instructor: req.userId,
      deleted: { $ne: true },
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
}
