/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import { Lesson, LessonDocument } from 'src/models/lesson.schema';
import {
  Course,
  CourseDocument,
  CourseStatus,
} from 'src/models/course.schema';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';
import {
  deleteFileS3,
  saveFileS3,
} from 'src/app/fileUpload/image-upload.service';
import { User, UserDocument } from 'src/models/user.schema';
import { EmailService } from 'src/app/email/email.service';
import { UserAdmin } from 'src/models/admin.schema';
import mongoose from 'mongoose';
import { TokenManager } from 'src/security/services/token-manager.service';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly tokenManager: TokenManager,

    private readonly emailService: EmailService,
  ) {}

  async getAllLessons(query: any, req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
    }

    const { page = 1, limit = 10, search = '' } = query;

    // Find all courses by this instructor
    const instructorCourses = await this.courseModel
      .find({
        instructor: req.userId,
      })
      .select('_id');

    const courseIds = instructorCourses.map((course) => course._id);

    // Build search query
    const searchQuery = {
      course: { $in: courseIds },
      ...(search && {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      }),
    };

    const lessons = await this.lessonModel
      .find(searchQuery)
      .populate('course')
      .populate('assignments')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.lessonModel.countDocuments(searchQuery);
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      instructor,
      req,
    );

    return {
      accessToken,
      refreshToken,
      page: Number(page),
      results: total,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }

  async createLesson(
    dto: CreateLessonDTO,
    files: { video?: Express.Multer.File[]; note?: Express.Multer.File[] },
    req: CustomRequest,
  ) {
    const { courseId } = dto;
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
    }

    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }
    const instructorId = course.instructorId.toString();

    if (instructorId !== req.userId) {
      throw customError.forbidden('You can only update your course');
    }

    let videoUrl: string | undefined;
    let noteUrl: string | undefined;

    try {
      if (files.video && files.video.length > 0) {
        const videoFile = files.video[0];
        videoUrl = await saveFileS3(videoFile, `lessons/${courseId}/videos/`);
      }

      if (files.note && files.note.length > 0) {
        const noteFile = files.note[0];
        noteUrl = await saveFileS3(noteFile, `lessons/${courseId}/notes/`);
      }

      const lastLesson = await this.lessonModel
        .findOne({ course: courseId })
        .sort({ position: -1 });

      const nextPosition = lastLesson ? lastLesson.position + 1 : 1;

      const lesson = new this.lessonModel({
        ...dto,
        videoUrl,
        noteUrl,
        course: courseId,
        instructor: req.userId,
        position: nextPosition,
      });

      course.status = CourseStatus.PENDING;
      await course.save();
      await lesson.save();

      await this.emailService.LessonCreation(
        instructor.email,
        instructor.firstName,
        course.title,
        lesson.title,
      );

      const { accessToken, refreshToken } = await this.tokenManager.signTokens(
        instructor,
        req,
      );

      return {
        accessToken,
        refreshToken,
        message: 'Lesson has been created successfully',
        lesson,
        course,
      };
    } catch (error) {
      console.log(error);
      throw new Error(error||"Something Went Wrong")
    }
  }
  async updateLesson(
    dto: UpdateLessonDTO,
    files: { video?: Express.Multer.File[]; note?: Express.Multer.File[] },
    req: CustomRequest,
    lessonId: string,
  ) {
    const lesson = await this.lessonModel.findById(lessonId);
    if (!lesson) {
      throw customError.notFound('Lesson not found');
    }

    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
    }

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) {
      throw customError.notFound('Course not found');
    }

    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden('You can only update your course');
    }

    try {
      if (files && files.video && files.video.length > 0) {
        if (lesson.videoUrl) {
          try {
            await deleteFileS3(lesson.videoUrl);
          } catch (err) {
            console.warn('Failed to delete old video:', err.message);
          }
        }
        const videoFile = files.video[0];
        const videoUrl = await saveFileS3(
          videoFile,
          `lessons/${lesson.courseId}/videos/`,
        );
        lesson.videoUrl = videoUrl;
      }

      if (files && files.note && files.note.length > 0) {
        if (lesson.noteUrl) {
          try {
            await deleteFileS3(lesson.noteUrl);
          } catch (err) {
            console.warn('Failed to delete old note:', err.message);
          }
        }
        const noteFile = files.note[0];
        const noteUrl = await saveFileS3(
          noteFile,
          `lessons/${lesson.courseId}/notes/`,
        );
        lesson.noteUrl = noteUrl;
      }

      if (dto.title) lesson.title = dto.title;
      if (dto.description) lesson.description = dto.description;
      if (dto.duration) lesson.duration = dto.duration;

      course.status = CourseStatus.PENDING;
      await course.save();
      await lesson.save();

      await this.emailService.LessonUpdating(
        instructor.email,
        instructor.firstName,
        course.title,
        lesson.title,
      );

      const { accessToken, refreshToken } = await this.tokenManager.signTokens(
        instructor,
        req,
      );

      return {
        accessToken,
        refreshToken,
        message: 'Lesson has been updated successfully',
        lesson,
        course,
      };
    } catch (error) {
      console.log(error);
        throw new Error(error || 'Something Went Wrong');

    }
  }

  async deleteLesson(lessonId: string, req: CustomRequest) {
    const lesson = await this.lessonModel
      .findById(lessonId)
      .populate<{ course: Course & { instructor: UserAdmin } }>({
        path: 'course',
        populate: { path: 'instructor' }, // also populate instructor
      });

    if (!lesson) throw customError.notFound('Lesson not found');
    const instructorId =
      lesson.course?.instructor instanceof mongoose.Types.ObjectId
        ? lesson.course.instructor.toString()
        : lesson.course?.instructor?._id?.toString();

    if (instructorId !== req.userId) {
      throw customError.forbidden(
        'You can only delete lessons from your own course',
      );
    }

    try {
      if (lesson.videoUrl) {
        try {
          await deleteFileS3(lesson.videoUrl);
        } catch (err) {
          console.warn('Failed to delete old video:', err.message);
        }
      }
      if (lesson.noteUrl) {
        try {
          await deleteFileS3(lesson.noteUrl);
        } catch (err) {
          console.warn('Failed to delete old note:', err.message);
        }
      }

      await this.lessonModel.findByIdAndDelete(lessonId);
      const instructor = lesson.course.instructor;

      await this.emailService.LessonDeletion(
        instructor.email,
        instructor.firstName,
        lesson.title,
        lesson.course.title,
      );

      const { accessToken, refreshToken } = await this.tokenManager.signTokens(
        instructor,
        req,
      );

      return {
        accessToken,
        refreshToken,
        message: 'Lesson deleted successfully',
      };
    } catch (error) {
      console.log(error);
         throw new Error(error || 'Something Went Wrong');

    }
  }

  async getLessons(courseId: string, query: any, req: CustomRequest) {
    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) throw customError.notFound('Instructor not found');
    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden(
        'You can only view lessons from your own course',
      );
    }

    const { page = 1, limit = 10 } = query;
    const lessons = await this.lessonModel
      .find({ course: courseId })
      .populate('course')
      .populate('assignments')
      .sort({ position: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.lessonModel.countDocuments({ course: courseId });

    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      instructor,
      req,
    );

    return {
      accessToken,
      refreshToken,
      page: Number(page),
      results: total,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }

  async getLessonsStudent(courseId: string, req: CustomRequest) {
        const instructor = await this.userModel.findById(req.userId);
        if (!instructor) throw customError.notFound('Instructor not found');
    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    const lessons = await this.lessonModel
      .find({ course: courseId })
      .populate('assignments')
      .sort({ position: 1 })

      .exec();

    const total = await this.lessonModel.countDocuments({ course: courseId });
    const { accessToken, refreshToken } = await this.tokenManager.signTokens(
      instructor,
      req,
    );

    return {
      accessToken,
      refreshToken,
      results: total,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }
}
