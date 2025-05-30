import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UploadApiResponse } from 'cloudinary';
import { Course, CourseDocument } from './course.schema';
import { User, UserDocument } from '../user/user.schema';
import { CreateCourseDto, UpdateCourseDto } from './course.dto';
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
            url: uploadedImage.secure_url,
            imageName: uploadedImage.public_id,
            caption: body.caption || '',
          }
        : undefined,
      instructor: new Types.ObjectId(userId),
      isSubmitted: true,
    };

    const newCourse = new this.courseModel(courseData);

    // Add course ID to the user's courses array (if that array exists)
    if (!user.courses) user.courses = [];
    user.courses.push(newCourse._id as Types.ObjectId);

    await newCourse.save();
    await user.save();

    return {
      message: 'Course has been created successfully',
      course: newCourse,
    };
  }

  async submitCourseForApproval(req: AuthenticatedRequest, id: string) {
    const course = await this.courseModel.findOne({ _id: id, deleted: false });
    if (!course) throw new NotFoundException("Such course isn't available");

    if (req.user.id.toString() !== course.instructor.toString()) {
      throw new UnauthorizedException('You are not authorized');
    }

    if (course.isSubmitted) {
      throw new UnauthorizedException('Course has been submitted already');
    }

    course.isSubmitted = true;
    await course.save();

    return { message: 'Course has been submitted for approval' };
  }

  async getSingleCourse(id: string) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException("Such course isn't available");

    return { message: 'Course fetched successfully', course };
  }

  async approveCourse(req: AuthenticatedRequest, id: string) {
    const course = await this.courseModel.findOne({ _id: id });
    if (!course) throw new NotFoundException('Course not found');

    if (!course.isSubmitted) {
      throw new UnauthorizedException('Course has to be submitted first');
    }
    if (course.isApproved) {
      throw new UnauthorizedException('Course has been approved already');
    }

    course.isApproved = true;
    course.approvedBy = new Types.ObjectId(req.user.id);
    course.approvalDate = new Date();
    await course.save();

    return { message: 'Course has been approved successfully' };
  }

  async publishCourse(req: AuthenticatedRequest, id: string) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    if (req.user.id.toString() !== course.instructor.toString()) {
      throw new UnauthorizedException('You are not authorized');
    }

    course.isPublished = !course.isPublished;
    await course.save();

    return { message: 'Course publish status updated' };
  }

  async getAllCourses() {
    const courses = await this.courseModel.find();
    if (!courses) throw new NotFoundException('No course found');
    return { message: 'Courses fetched successfully', courses };
  }

  async filterCourses(query: any) {
    const { category, instructor } = query;
    const filter: any = { isApproved: true };

    if (category) filter.category = category;
    if (instructor) filter.instructor = instructor;

    const courses = await this.courseModel.find(filter);
    const count = await this.courseModel.countDocuments(courses);

    return { message: 'Courses fetched successfully', courses, count };
  }

  async getAllCoursesByAnInstructor(instructorId: string) {
    const instructor = await this.userModel.findOne({
      _id: instructorId,
      role: 'instructor',
    });
    if (!instructor) throw new ForbiddenException('Instructor not found');

    const courses = await this.courseModel.find({
      instructor: instructorId,
    });

    return { message: 'Courses fetched successfully', courses };
  }

  async updateCourse(
    req: AuthenticatedRequest,
    updateDto: UpdateCourseDto,
    id: string,
  ) {
    const existingCourse = await this.courseModel.findOne({
      _id: id,
    });
    if (!existingCourse) throw new NotFoundException('Course not found');

    if (existingCourse.instructor.toString() !== req.user.id.toString()) {
      throw new UnauthorizedException('You can only update your course');
    }

    const updatedCourse = await this.courseModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true },
    );

    return { message: 'Course updated successfully', course: updatedCourse };
  }

  async deleteCourse(req: AuthenticatedRequest, id: string) {
    const existingCourse = await this.courseModel.findOne({
      _id: id,
    });
    if (!existingCourse) throw new NotFoundException('Course not found');

    if (existingCourse.instructor.toString() !== req.user.id.toString()) {
      throw new UnauthorizedException('You can only delete your course');
    }

    await this.courseModel.findByIdAndUpdate(id, { deleted: true });
    await this.userModel.updateMany(
      { enrolledCourses: id },
      { $pull: { enrolledCourses: id } },
    );

    return { message: 'Course deleted successfully' };
  }
}
