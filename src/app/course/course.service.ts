import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { User } from '../user/user.entity';
import { Lesson } from '../lesson/lesson.entity';
import { Category } from '../database/main.entity';
import { CreateCourseDTO } from './course.dto';
import { CustomRequest } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { singleImageValidation } from 'src/utils/file-validation';
import { deleteImageS3, saveImageS3 } from '../fileUpload/image-upload.service';
import { DBQuery, DBQueryCount, QueryString } from '../database/dbquery';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,

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

      categoryEntity = found; // ✅ safe now
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
    });

    await this.courseRepo.save(course);

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

    await this.courseRepo.save(course);

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
    // Build the query for fetching data
    const fetchCourses = new DBQuery(this.courseRepo, 'course', query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //   Populate the instructor and category to each course
    fetchCourses.query
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category');

    const courseQuery = fetchCourses.query;
    const courses = await courseQuery.getMany();
    const page = fetchCourses.page;

    // Build the query for counting total results
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

    return {
      message: 'Course deleted successfully',
    };
  }
}
