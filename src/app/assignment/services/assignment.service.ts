/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Assignment,
  AssignmentDocument,
} from 'src/models/assignment.schema';
import { Course, CourseDocument, CourseStatus } from 'src/models/course.schema';
import { User, UserDocument } from 'src/models/user.schema';
import { Lesson, LessonDocument } from 'src/models/lesson.schema';
import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import {
  deleteFileS3,
  saveFileS3,
} from 'src/app/fileUpload/image-upload.service';
import { EmailService } from 'src/app/email/email.service';
import { CreateAssignmentDTO, UpdateAssignmentDTO } from '../assignment.dto';


@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel(Assignment.name)
    private assignmentModel: Model<AssignmentDocument>,
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Lesson.name) private lessonModel: Model<LessonDocument>,
    private readonly emailService: EmailService,
  ) {}

  async createAssignment(
    dto: CreateAssignmentDTO,
    file: Express.Multer.File,
    req: CustomRequest,
  ) {
    if (!file) throw customError.notFound('file is required');

    const { title, lessonId, description } = dto;
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

    const existingLessonAssignment = await this.assignmentModel.findOne({
      lessonId,
    });
    if (existingLessonAssignment) {
      throw new NotFoundException('Assignment already exists for this lesson');
    }

    try {
      const fileUrl = await saveFileS3(
        file,
        `lessons/${course.id}/assignments/`,
      );

      const assignment = new this.assignmentModel({
        title,
        description,
        fileUrl,
        lesson: lessonId,
        lessonId: lesson.id,
        instructor: instructor.id,
        instructorId: instructor.id,
      });

      await assignment.save();

      await this.emailService.AssignmentCreation(
        instructor.email,
        instructor.firstName,
        assignment.title,
        lesson.title,
        course.title,
      );

      return {
        accessToken: req.token,
        message: 'Assignment has been created successfully',
        lesson,
        assignment,
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCode || 500,
      );
    }
  }

  async updateAssignment(
    assignmentId: string,
    dto: UpdateAssignmentDTO,
    files: { file?: Express.Multer.File[] },
    req: CustomRequest,
  ) {
    const assignment = await this.assignmentModel.findById(assignmentId);
    if (!assignment) {
      throw customError.notFound('Assignment not found');
    }

    const instructor = await this.userModel.findById(req.userId);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
    }

    const lesson = await this.lessonModel.findById(assignment.lessonId);
    if (!lesson) {
      throw customError.notFound('Lesson not found');
    }

    const course = await this.courseModel.findById(lesson.courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (assignment.instructorId !== instructor.id) {
      throw customError.forbidden('You can only update your assignment');
    }

    try {
      if (files && files.file && files.file.length > 0) {
        if (assignment.fileUrl) {
          try {
            await deleteFileS3(assignment.fileUrl);
          } catch (err) {
            console.warn('Failed to delete old file:', err.message);
          }
        }
        const fileFile = files.file[0];
        const fileUrl = await saveFileS3(
          fileFile,
          `lessons/${lesson.courseId}/assignments/`,
        );
        assignment.fileUrl = fileUrl;
      }

      if (dto.title) assignment.title = dto.title;
      if (dto.description) assignment.description = dto.description;

      course.status = CourseStatus.PENDING;
      await course.save();
      await assignment.save();

      await this.emailService.AssignmentUpdate(
        instructor.email,
        instructor.firstName,
        assignment.title,
        course.title,
        lesson.title,
      );

      return {
        accessToken: req.token,
        message: 'Assignment has been updated successfully',
        lesson,
        assignment,
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCode || 500,
      );
    }
  }

  async deleteAssignment(assignmentId: string, req: CustomRequest) {
    const assignment = await this.assignmentModel.findById(assignmentId);

    if (!assignment) {
      throw customError.notFound('Assignment not found');
    }

    if (assignment.instructorId !== req.userId) {
      throw customError.forbidden('You can only delete assignment you created');
    }
    const instructor = await this.userModel.findById(assignment.instructor);
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }
    const lesson = await this.lessonModel.findById(assignment.lesson);
    if (!lesson) {
      throw customError.notFound('Lesson not found');
    }

    try {
      if (assignment.fileUrl) {
        try {
          await deleteFileS3(assignment.fileUrl);
        } catch (err) {
          console.warn('Failed to delete old file:', err.message);
        }
      }

      await this.assignmentModel.findByIdAndDelete(assignmentId);

      await this.emailService.AssignmentDeletion(
        instructor.email,
        instructor.firstName,
        assignment.title,
        lesson.title,
      );

      return {
        accessToken: req.token,
        message: 'Assignment deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCode || 500,
      );
    }
  }

  async getAssignmentsInCourse(
    courseId: string,
    query: any,
    req: CustomRequest,
  ) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw customError.notFound('Course not found');

    if (String(course.instructorId) !== req.userId) {
      throw customError.forbidden(
        'You can only view assignments from your own course',
      );
    }

    const lessons = await this.lessonModel.find({ courseId });
    const lessonIds = lessons.map((lesson) => lesson._id);

    const assignments = await this.assignmentModel
      .find({ lessonId: { $in: lessonIds } })
      .populate('instructor')
      .exec();

    return {
      accessToken: req.token,
      assignments,
      message: 'Assignments fetched successfully',
    };
  }

  async getAssignmentsByInstructor(
    instructorId: string,
    query: any,
    req: CustomRequest,
  ) {
    if (req.userId !== instructorId) {
      throw customError.forbidden('You can only view your own assignments');
    }

    const assignments = await this.assignmentModel
      .find({ instructorId })
      .populate('instructor')
      .exec();

    return {
      accessToken: req.token,
      assignments,
      message: 'Assignments fetched successfully',
    };
  }
}
