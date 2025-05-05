import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lecture } from './lecture.schema';
import { Course } from '../course/course.schema';
import { User } from '../user/user.schema';
import { CloudinaryService } from '../domain/services/cloudinary.service';
import { AuthenticatedRequest } from '../domain/middleware/role.guard';
import { UploadApiResponse } from 'cloudinary';
import { CreateLectureDto } from './lecture.dto';

@Injectable()
export class LectureService {
  constructor(
    @InjectModel(Lecture.name) private lectureModel: Model<Lecture>,
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createLecture(
    req: any,
    courseId: string,
    files: { video: Express.Multer.File[]; notes?: Express.Multer.File[] },
    body: CreateLectureDto,
  ) {
    const course = await this.courseModel.findOne({
      _id: courseId,
    });

    if (!course) throw new NotFoundException("Course can't be found");

    if (req.user.id.toString() !== course.instructor.toString()) {
      throw new UnauthorizedException('You are not authorized');
    }

    if (courseId.toString() !== course.id.toString())
      throw new UnauthorizedException(
        'You are not authorized to add lecturee to this course',
      );

    // Upload video file
    const uploadedVideo = await this.cloudinaryService.uploadVideo(
      files.video[0],
    );

    let uploadedNotes: UploadApiResponse | null = null;
    if (files.notes && files.notes[0]) {
      uploadedNotes = await this.cloudinaryService.uploadVideo(files.notes[0]);
    }

    // Save Lecture
    const newLecture = new this.lectureModel({
      title: body.title,
      duration: body.duration,
      video: uploadedVideo.public_id,
      notes: uploadedNotes?.public_id,
      instructor: req.user.id,
      course: courseId,
    });

    course.lectures.push(newLecture._id as Types.ObjectId);
    await newLecture.save();
    await course.save();

    return {
      message: 'Lecture created successfully',
      lecture: newLecture,
    };
  }

  async getSingleLecture(id: string) {
    const lecture = await this.lectureModel.findOne({
      _id: id,
      deleted: false,
    });
    if (!lecture)
      throw new NotFoundException("Lecture can't be found or has been deleted");
    return { message: 'Lecture found successfully', lecture };
  }

  async getAllLecturesInACourse(courseId: string) {
    const lectures = await this.lectureModel
      .find({ course: courseId, deleted: false })
      .sort({ createdAt: 1 });
    const course = await this.courseModel.findOne({
      _id: courseId,
      deleted: false,
    });

    if (!lectures.length) throw new NotFoundException('No lectures found');

    return { message: 'Lectures found successfully', lectures, course };
  }

  async updateLecture(req: any, id: string, files: any) {
    const lecture = await this.lectureModel.findOne({ _id: id });
    if (!lecture || lecture.deleted)
      throw new NotFoundException('Lecture not found or has been deleted');

    const updatedFields: any = {};

    if (files['video'] && files['video'][0]) {
      const video = await uploadVideo(req, null, files['video'][0]);
      updatedFields.video = video.uploadVideo._id;
    }

    if (files['notes'] && files['notes'][0]) {
      const notes = await uploadDocs(req, null, files['notes'][0]);
      updatedFields.notes = notes.file._id;
    }

    if (req.body.title) updatedFields.title = req.body.title;
    if (req.body.duration) updatedFields.duration = req.body.duration;

    const updatedLecture = await this.lectureModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true },
    );

    return { message: 'Lecture updated successfully', lecture: updatedLecture };
  }

  async deleteSingleLecture(id: string) {
    const lecture = await this.lectureModel.findOne({ _id: id });
    if (!lecture) throw new NotFoundException('Lecture does not exist');
    if (lecture.deleted)
      throw new UnauthorizedException('Lecture already deleted');

    await this.lectureModel.findByIdAndUpdate(id, { deleted: true });
    return { message: 'Lecture deleted successfully' };
  }

  async deleteAllLectureInACourse(req: AuthenticatedRequest, id: string) {
    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('Course does not exist');

    if (req.user.id.toString() !== course.instructor.toString()) {
      throw new UnauthorizedException('You are not authorized');
    }

    await this.lectureModel.updateMany(
      { _id: { $in: course.lectures } },
      { $set: { deleted: true } },
    );
    await this.courseModel.findByIdAndUpdate(id, { lectures: [] });

    return { message: 'Lectures deleted successfully' };
  }
}
