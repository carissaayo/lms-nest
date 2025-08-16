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

  //    * Add a lesson to a course
  //    */
  //   async addLessonToCourse(
  //     courseId: string,
  //     instructorId: string,
  //     title: string,
  //     content: string,
  //     videoUrl?: string,
  //   ) {
  //     const course = await this.courseRepo.findOne({
  //       where: { id: courseId },
  //       relations: ['instructor', 'lessons'],
  //     });

  //     if (!course) {
  //       throw new NotFoundException('Course not found');
  //     }

  //     if (course.instructor.id !== instructorId) {
  //       throw new ForbiddenException(
  //         'You are not allowed to add lessons to this course',
  //       );
  //     }

  //     const lesson = this.lessonRepo.create({
  //       title,
  //       content,
  //       videoUrl,
  //       course,
  //     });

  //     await this.lessonRepo.save(lesson);

  //     return lesson;
  //   }
  // }

  // import {
  //   Injectable,
  //   UnauthorizedException,
  //   NotFoundException,
  //   ForbiddenException,
  //   InternalServerErrorException,
  // } from '@nestjs/common';
  // import { InjectModel } from '@nestjs/mongoose';
  // import { Model, Types } from 'mongoose';
  // import { UploadApiResponse } from 'cloudinary';
  // import { Course, CourseDocument } from './course.schema';
  // import { User, UserDocument } from '../user/user.schema';
  // import { CreateCourseDto, UpdateCourseDto } from './course.dto';
  // import { AuthenticatedRequest } from '../domain/middleware/role.guard';
  // import { CloudinaryService } from '../domain/services/cloudinary.service';

  // @Injectable()
  // export class CourseService {
  //   constructor(
  //     @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
  //     @InjectModel(User.name) private userModel: Model<UserDocument>,
  //     private cloudinaryService: CloudinaryService,
  //   ) {}

  //   async createCourse(
  //     req: AuthenticatedRequest,
  //     body: CreateCourseDto,
  //     file: Express.Multer.File,
  //   ) {
  //     const userId = req.user.id;

  //     const user = await this.userModel.findById(userId);
  //     if (!user) {
  //       throw new UnauthorizedException(
  //         "You don't have the permissions to create a course",
  //       );
  //     }

  //     let uploadedImage: UploadApiResponse | null = null;

  //     if (file) {
  //       // Upload image using Cloudinary service
  //       uploadedImage = await this.cloudinaryService.uploadImage(file, 'course');
  //     }

  //     const courseData: Partial<Course> = {
  //       ...body,
  //       image: uploadedImage
  //         ? {
  //             url: uploadedImage.secure_url,
  //             imageName: uploadedImage.public_id,
  //             caption: body.caption || '',
  //           }
  //         : undefined,
  //       instructor: new Types.ObjectId(userId),
  //       isSubmitted: true,
  //     };

  //     const newCourse = new this.courseModel(courseData);

  //     // Add course ID to the user's courses array (if that array exists)
  //     if (!user.courses) user.courses = [];
  //     user.courses.push(newCourse._id as Types.ObjectId);

  //     await newCourse.save();
  //     await user.save();

  //     return {
  //       message: 'Course has been created successfully',
  //       course: newCourse,
  //     };
  //   }

  //   async submitCourseForApproval(req: AuthenticatedRequest, id: string) {
  //     const course = await this.courseModel.findOne({ _id: id, deleted: false });
  //     if (!course) throw new NotFoundException("Such course isn't available");

  //     if (req.user.id.toString() !== course.instructor.toString()) {
  //       throw new UnauthorizedException('You are not authorized');
  //     }

  //     if (course.isSubmitted) {
  //       throw new UnauthorizedException('Course has been submitted already');
  //     }

  //     course.isSubmitted = true;
  //     await course.save();

  //     return { message: 'Course has been submitted for approval' };
  //   }

  //   async getSingleCourse(id: string) {
  //     const course = await this.courseModel.findById(id);
  //     if (!course) throw new NotFoundException("Such course isn't available");

  //     return { message: 'Course fetched successfully', course };
  //   }

  //   async approveCourse(req: AuthenticatedRequest, id: string) {
  //     const course = await this.courseModel.findOne({ _id: id });
  //     if (!course) throw new NotFoundException('Course not found');

  //     if (!course.isSubmitted) {
  //       throw new UnauthorizedException('Course has to be submitted first');
  //     }
  //     if (course.isApproved) {
  //       throw new UnauthorizedException('Course has been approved already');
  //     }

  //     course.isApproved = true;
  //     course.approvedBy = new Types.ObjectId(req.user.id);
  //     course.approvalDate = new Date();
  //     await course.save();

  //     return { message: 'Course has been approved successfully' };
  //   }

  //   async publishCourse(req: AuthenticatedRequest, id: string) {
  //     const course = await this.courseModel.findById(id);
  //     if (!course) throw new NotFoundException('Course not found');
  //     if (req.user.id.toString() !== course.instructor.toString()) {
  //       throw new UnauthorizedException('You are not authorized');
  //     }

  //     course.isPublished = !course.isPublished;
  //     await course.save();

  //     return { message: 'Course publish status updated' };
  //   }

  //   async getAllCourses() {
  //     const courses = await this.courseModel.find();
  //     if (!courses) throw new NotFoundException('No course found');
  //     return { message: 'Courses fetched successfully', courses };
  //   }

  //   async filterCourses(query: any) {
  //     const { category, instructor } = query;
  //     const filter: any = { isApproved: true };

  //     if (category) filter.category = category;
  //     if (instructor) filter.instructor = instructor;

  //     const courses = await this.courseModel.find(filter);
  //     const count = await this.courseModel.countDocuments(courses);

  //     return { message: 'Courses fetched successfully', courses, count };
  //   }

  //   async getAllCoursesByAnInstructor(instructorId: string) {
  //     const instructor = await this.userModel.findOne({
  //       _id: instructorId,
  //       role: 'instructor',
  //     });
  //     if (!instructor) throw new ForbiddenException('Instructor not found');

  //     const courses = await this.courseModel.find({
  //       instructor: instructorId,
  //     });

  //     return { message: 'Courses fetched successfully', courses };
  //   }

  //   async updateCourse(
  //     req: AuthenticatedRequest,
  //     updateDto: UpdateCourseDto,
  //     id: string,
  //   ) {
  //     const existingCourse = await this.courseModel.findOne({
  //       _id: id,
  //     });
  //     if (!existingCourse) throw new NotFoundException('Course not found');

  //     if (existingCourse.instructor.toString() !== req.user.id.toString()) {
  //       throw new UnauthorizedException('You can only update your course');
  //     }

  //     const updatedCourse = await this.courseModel.findByIdAndUpdate(
  //       id,
  //       updateDto,
  //       { new: true },
  //     );

  //     return { message: 'Course updated successfully', course: updatedCourse };
  //   }

  //   async deleteCourse(req: AuthenticatedRequest, id: string) {
  //     const existingCourse = await this.courseModel.findOne({
  //       _id: id,
  //     });
  //     if (!existingCourse) throw new NotFoundException('Course not found');

  //     if (existingCourse.instructor.toString() !== req.user.id.toString()) {
  //       throw new UnauthorizedException('You can only delete your course');
  //     }

  //     await this.courseModel.findByIdAndUpdate(id, { deleted: true });
  //     await this.userModel.updateMany(
  //       { enrolledCourses: id },
  //       { $pull: { enrolledCourses: id } },
  //     );

  //     return { message: 'Course deleted successfully' };
  //   }
}
