/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UploadApiResponse } from 'cloudinary';
import { Course, CourseDocument } from './course.schema';
import { User, UserDocument } from '../user/user.schema';
import { CreateCourseDto } from './course.dto';
import { AuthenticatedRequest } from '../domain/middleware/role.guard';
import { CloudinaryService } from '../domain/services/cloudinary.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createCourse(
    req: AuthenticatedRequest,
    body: CreateCourseDto,
    file: Express.Multer.File,
  ) {
    const userId = req.user.id;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException(
        "You don't have the permissions to create a course",
      );
    }

    let uploadedImage: UploadApiResponse | null = null;

    if (file) {
      // Upload image using Cloudinary service
      uploadedImage = await this.cloudinaryService.uploadImage(file, 'course');
    }

    const courseData: Partial<Course> = {
      ...body,
      image: uploadedImage
        ? {
            url: uploadedImage?.secure_url,
            imageName: uploadedImage?.public_id,
            caption: body.caption || '',
          }
        : null,
      instructor: userId,
      isSubmitted: true,
    };

    const newCourse = new this.courseModel(courseData);

    // Add course ID to the user's courses array (if that array exists)
    if (!user.courses) user.courses = [];
    user.courses.push(newCourse._id);

    await newCourse.save();
    await user.save();

    return {
      message: 'Course has been created successfully',
      course: newCourse,
    };
  }

  async submitCourseForApproval(id: string, user: User) {
    const course = await this.courseModel.findOne({ _id: id, deleted: false });
    if (!course) throw new NotFoundException("Such course isn't available");

    if (
      user.role !== 'instructor' ||
      user._id.toString() !== course.instructor.toString()
    ) {
      throw new UnauthorizedException('You are not authorized');
    }

    if (course.isSubmitted) {
      throw new UnauthorizedException('Course has been submitted already');
    }

    course.isSubmitted = true;
    await course.save();

    return { message: 'Course has been submitted for approval', course };
  }

  async getSingleCourse(id: string) {
    const isItDeleted = await this.courseModel.findOne({
      _id: id,
      deleted: true,
    });
    if (isItDeleted) throw new ForbiddenException('Course has been deleted');

    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException("Such course isn't available");

    return { message: 'Course fetched successfully', course };
  }

  async approveCourse(id: string, user: User) {
    if (user.role !== 'moderator') {
      throw new UnauthorizedException('Access denied');
    }

    const course = await this.courseModel.findOne({ _id: id, deleted: false });
    if (!course) throw new NotFoundException('Course not found');

    if (course.isApproved) {
      throw new UnauthorizedException('Course has been approved already');
    }

    course.isApproved = true;
    course.approvedBy = user._id;
    course.approvalDate = new Date();
    await course.save();

    return { message: 'Course has been approved successfully', course };
  }

  async publishCourse(id: string, user: User) {
    const isItDeleted = await this.courseModel.findOne({
      _id: id,
      deleted: true,
    });
    if (isItDeleted) throw new ForbiddenException('Course has been deleted');

    if (user.role !== 'instructor') {
      throw new UnauthorizedException('Access denied');
    }

    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('Course not found');

    course.isPublished = !course.isPublished;
    await course.save();

    return { message: 'Course publish status updated', course };
  }

  async getAllCourses(user: User) {
    if (!user.isAdmin) throw new UnauthorizedException('Access Denied');

    const courses = await this.courseModel.find({ deleted: false });
    return { message: 'Courses fetched successfully', courses };
  }

  async filterCourses(query: any) {
    const { category, instructor } = query;
    const filter: any = { deleted: false, isPublished: true, isApproved: true };

    if (category) filter.category = category;
    if (instructor) filter.instructor = instructor;

    const courses = await this.courseModel.find(filter);
    const count = await this.courseModel.countDocuments(filter);

    return { message: 'Courses fetched successfully', courses, count };
  }

  async getInstructorCourses(instructorId: string) {
    const instructor = await this.userModel.findOne({
      _id: instructorId,
      deleted: true,
      role: 'instructor',
    });
    if (instructor) throw new ForbiddenException('Instructor has been deleted');

    const courses = await this.courseModel.find({
      instructor: instructorId,
      deleted: false,
    });

    return { message: 'Courses fetched successfully', courses };
  }

  async updateCourse(id: string, updateDto: UpdateCourseDto, user: User) {
    const deletedCourse = await this.courseModel.findOne({
      _id: id,
      deleted: true,
    });
    if (deletedCourse) throw new ForbiddenException('Course has been deleted');

    const existingCourse = await this.courseModel.findOne({
      _id: id,
      deleted: false,
    });
    if (!existingCourse) throw new NotFoundException('Course not found');

    if (existingCourse.instructor.toString() !== user._id.toString()) {
      throw new UnauthorizedException('You can only update your course');
    }

    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    );

    return { message: 'Course updated successfully', course: updatedCourse };
  }

  async deleteCourse(id: string, user: User) {
    const deletedCourse = await this.courseModel.findOne({
      _id: id,
      deleted: true,
    });
    if (deletedCourse)
      throw new UnauthorizedException('Course already deleted');

    const existingCourse = await this.courseModel.findOne({
      _id: id,
      deleted: false,
    });
    if (!existingCourse) throw new NotFoundException('Course not found');

    if (
      !user.isAdmin &&
      existingCourse.instructor.toString() !== user._id.toString()
    ) {
      throw new UnauthorizedException('You can only delete your course');
    }

    await this.courseModel.findByIdAndUpdate(id, { deleted: true });
    await this.userModel.updateMany(
      { enrolledCourses: id },
      { $pull: { enrolledCourses: id } },
    );

    return { message: 'Course deleted successfully' };
  }

  async deleteCoursesByInstructor(instructorId: string, user: User) {
    if (!user.isAdmin && instructorId !== user._id.toString()) {
      throw new UnauthorizedException('Access denied');
    }

    await this.courseModel.deleteMany({ instructor: instructorId });

    return { message: 'Courses deleted successfully' };
  }
}
