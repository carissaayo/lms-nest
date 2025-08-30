/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { EmailService } from '../email/email.service';

import { Course, CourseStatus } from './course.entity';
import { User } from '../user/user.entity';
import { Category } from '../database/main.entity';
import { CreateCourseDTO } from './course.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { singleImageValidation } from 'src/utils/file-validation';
import { deleteImageS3, saveImageS3 } from '../fileUpload/image-upload.service';

import { DBQuery, QueryString } from '../database/dbquery';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

    private readonly emailService: EmailService,

    // @InjectRepository(Lesson)
    // private readonly lessonRepo: Repository<Lesson>,
  ) {}

  /**
   * Create a new course
   */
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
      throw customError.badRequest('coverImage is required found');
    }

    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    let categoryEntity: Category | undefined;

    if (category) {
      const found = await this.categoryRepo.findOne({
        where: { id: category },
      });

      if (!found) {
        throw new NotFoundException('Category not found');
      }

      categoryEntity = found;
    }

    singleImageValidation(coverImage, 'a cover image for the course');

    const uploadImg = await saveImageS3(coverImage, `images/courses`);
    if (!uploadImg || uploadImg.length <= 0) {
      throw customError.badRequest('Invalid cover Image');
    }

    const course = this.courseRepo.create({
      title,
      description,
      category: categoryEntity,
      price,
      instructor,
      coverImage: uploadImg,
      instructorId: instructor.id,
      categoryId: category,
      categoryName: categoryEntity?.name,
      instructorName: `${instructor.firstName} ${instructor.lastName}`,
    });

    await this.courseRepo.save(course);

    // // Send submission email
    await this.emailService.courseCreation(
      instructor.email,
      instructor.firstName,
      course.title,
    );
    return {
      accessToken: req.token,
      course,
      message: 'Course created successfully',
    };
  }

  /**
   * Edit an existing course
   */
  async updateCourse(
    courseId: string,
    updateCourseDto: Partial<CreateCourseDTO>,
    coverImage: Express.Multer.File,
    req: CustomRequest,
  ) {
    if (!updateCourseDto && !coverImage) {
      throw customError.badRequest('No update data provided');
    }

    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw customError.notFound('Course not found');
    }

    if (course.instructor.id !== req.userId) {
      throw customError.forbidden('You can only update your  course');
    }

    const { title, description, category, price } = updateCourseDto || {};

    if (category) {
      const foundCategory = await this.categoryRepo.findOne({
        where: { id: category },
      });
      if (!foundCategory) {
        throw customError.notFound('Category not found');
      }
      course.category = foundCategory;
    }

    if (coverImage) {
      singleImageValidation(coverImage, 'a cover image for the course');

      // Delete old image from S3 if exists
      if (course.coverImage) {
        try {
          await deleteImageS3(course.coverImage);
        } catch (err) {
          console.warn(' Failed to delete old cover image:', err.message);
        }
      }

      // Upload new one
      const uploadImg = await saveImageS3(coverImage, `images/courses`);
      if (!uploadImg || uploadImg.length <= 0) {
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
    await this.courseRepo.save(course);
    const instructor = course.instructor;
    // // Send updating email
    await this.emailService.courseUpdating(
      instructor.email,
      instructor.firstName,
      course.title,
    );
    return {
      accessToken: req.token,
      course,
      message: 'Course updated successfully',
    };
  }

  /**
   * Get all courses  by an instructor
   */
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
   * Delete a course  by an instructor
   */
  async deleteCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, deleted: false },
      relations: ['instructor'],
    });

    if (!course) {
      throw customError.notFound('Course not found');
    }
    if (course.instructor.id !== req.userId) {
      throw customError.forbidden('You can only delete your courses');
    }

    course.deleted = true;
    await this.courseRepo.save(course);

    await this.courseRepo.save(course);
    const instructor = course.instructor;
    // // Send submission email
    await this.emailService.courseDeletion(
      instructor.email,
      instructor.firstName,
      course.title,
    );
    return {
      message: 'Course deleted successfully',
    };
  }

  /**
   * Submit a course for approval  by an instructor
   */
  async submitCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    if (!course) {
      throw customError.notFound('Course not found');
    }
    if (course.deleted) throw customError.notFound('Course has been deleted');

    if (course.instructor.id !== req.userId) {
      throw customError.forbidden('You can only delete your courses');
    }

    if (course.isSubmitted) {
      throw customError.forbidden('This course has already been submitted');
    }
    if (course.status !== CourseStatus.PENDING) {
      throw customError.forbidden('This course can not be submitted');
    }
    try {
      course.isSubmitted = true;
      course.submittedAt = new Date();

      await this.courseRepo.save(course);
      const instructor = course.instructor;
      // // Send submission email
      await this.emailService.courseSubmission(
        instructor.email,
        instructor.firstName,
        course.title,
      );

      return {
        message: 'Course submitted successfully',
        accessToken: req.token,
        course,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Internal Server Error');
    }
  }

  /**
   * Submit a course for approval  by an instructor
   */
  async publishCourse(courseId: string, req: CustomRequest) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    if (!course) {
      throw customError.notFound('Course not found');
    }
    if (course.deleted) throw customError.notFound('Course has been deleted');

    if (course.instructor.id !== req.userId) {
      throw customError.forbidden('You can only publish your courses');
    }

    if (course.status !== CourseStatus.APPROVED) {
      throw customError.forbidden('This course has to be approved first');
    }
    try {
      course.isPublished = true;
      course.publishedAt = new Date();

      await this.courseRepo.save(course);
      const instructor = course.instructor;
      // // Send pbulishing email
      await this.emailService.coursePublish(
        instructor.email,
        instructor.firstName,
        course.title,
      );

      return {
        message: 'Course submitted successfully',
        accessToken: req.token,
        course,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error.message || 'Internal Server Error');
    }
  }
}
