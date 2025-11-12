/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { EmailService } from 'src/app/email/email.service';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/app/models/course.schema';
import { User, UserDocument } from 'src/app/models/user.schema';

import { CreateCourseDTO } from '../course.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { singleImageValidation } from 'src/utils/file-validation';
import {
  deleteImageS3,
  saveImageS3,
} from 'src/app/fileUpload/image-upload.service';
import { customError } from 'src/libs/custom-handlers';
import { CourseCategory } from '../course.interface';
import { Lesson, LessonDocument } from 'src/app/models/lesson.schema';
import { TokenManager } from 'src/security/services/token-manager.service';

@Injectable()
export class InstructorCourseService {
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

    const { title, description, category, price ,duration} = createCourseDto;

    if (!coverImage) {
      throw customError.badRequest('coverImage is required');
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
      category,
      price,
      coverImage: uploadImg,
      instructorId: instructor.id,
      duration,
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
    });

    await course.save();

    this.emailService.courseCreation(
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
    const instructorId = course.instructor.toString();
    if (instructorId !== req.userId) {
      throw customError.forbidden('You can only update your course');
    }

    const instructor = await this.userModel.findById(course.instructor);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    const { title, description, category, price ,duration} = updateCourseDto || {};

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
    if (duration) course.duration = duration;
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

  async deleteCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }
    const instructor = await this.userModel.findById(course.instructor);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    if (String(course.instructor) !== req.userId) {
      throw customError.forbidden('You can only delete your courses');
    }

    course.deleted = true;
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
    const instructor = await this.userModel.findById(course.instructor);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    if (course.deleted) throw customError.notFound('Course has been deleted');
    if (String(course.instructor) !== req.userId) {
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

    if (course.deleted) throw customError.notFound('Course has been deleted');

    const instructor = await this.userModel.findById(course.instructor);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    if (String(course.instructor) !== req.userId) {
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
    if (course.deleted) throw customError.notFound('Course has been deleted');

    return {
      course,
      message: 'Course fetched successfully',
    };
  }

  async viewInstructorCourses(req: CustomRequest, query: any) {

    const instructor = await this.userModel.findOne({_id:req.userId})

    if(!instructor)throw customError.notFound("Instructor not found");

    const { status, title, sort, page = 1, limit = 10 } = query;

    const filter: any = {
      instructor: instructor.id,
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
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      instructor,
      req,
    );

    return {
      accessToken,
      refreshToken,
      page: Number(page),
      results: total,
      courses,
      message: 'Your courses has been fetched successfully',
    };
  }
}
