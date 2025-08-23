import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Assignment } from '../assignment.entity';
// import { Submission } from 'src/app/submission/submission.entity';
// import { Enrollment } from 'src/app/database/main.entity';
import { Course, CourseStatus } from 'src/app/course/course.entity';
import { User } from 'src/app/user/user.entity';
import { Lesson } from 'src/app/lesson/lesson.entity';
import { customError } from 'libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import {
  deleteFileS3,
  saveFileS3,
} from 'src/app/fileUpload/image-upload.service';
import { EmailService } from 'src/app/email/email.service';
import { CreateAssignmentDTO, UpdateAssignmentDTO } from '../assignment.dto';
import { DBQuery, QueryString } from 'src/app/database/dbquery';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentRepo: Repository<Assignment>,

    // @InjectRepository(Submission)
    // private submissionRepo: Repository<Submission>,

    // @InjectRepository(Enrollment)
    // private enrollmentRepo: Repository<Enrollment>,

    @InjectRepository(Course)
    private courseRepo: Repository<Course>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    private readonly emailService: EmailService,
  ) {}

  async createAssignment(
    dto: CreateAssignmentDTO,
    file: Express.Multer.File,
    req: CustomRequest,
  ) {
    if (!file) throw customError.notFound('file is required');
    const { title, lessonId, description } = dto;
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });

    if (!lesson) {
      throw customError.notFound('Lesson not found');
    }
    const courseId = lesson?.courseId;

    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
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
    if (!course) throw new NotFoundException('Course not found');
    const existingLessonAssignment = await this.assignmentRepo.findOne({
      where: { lessonId },
    });

    if (existingLessonAssignment)
      throw new NotFoundException('Assignment already exist for this course');
    try {
      let fileUrl: string | undefined = undefined;
      fileUrl = await saveFileS3(file, `lessons/${courseId}/assignments/`);

      const assignment = this.assignmentRepo.create({
        title,
        description,
        fileUrl,
        lesson,
        lessonId: lesson.id,
        instructor,
        instructorId: instructor.id,
      });

      await this.assignmentRepo.save(assignment);

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
        error.statusCOde || 500,
      );
    }
  }

  //   // 📌 Update assignment (can re-upload file)
  async updateAssignment(
    assignmentId: string,
    dto: UpdateAssignmentDTO,
    files: { file?: Express.Multer.File[] },
    req: CustomRequest,
  ) {
    // const { title,  description } = dto;
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw customError.notFound('Assignment not found');
    }

    const instructor = await this.userRepo.findOne({
      where: { id: req.userId },
    });
    if (!instructor) {
      throw customError.notFound('Instructor not found');
    }

    if (!instructor.isActive) {
      throw customError.notFound('Your account has been suspended');
    }

    const lesson = await this.lessonRepo.findOne({
      where: { id: assignment.lessonId },
    });

    if (!lesson) {
      throw customError.notFound('Lesson not found');
    }

    const course = await this.courseRepo.findOne({
      where: { id: lesson.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (assignment.instructorId !== instructor.id) {
      throw customError.forbidden('You can only update your  assignment');
    }

    try {
      let fileUrl: string | undefined = undefined;
      if (files && files.file && files.file.length > 0) {
        if (assignment.fileUrl) {
          try {
            await deleteFileS3(assignment.fileUrl);
          } catch (err) {
            console.warn(' Failed to delete old video:', err.message);
          }
        }
        const fileFile = files.file[0];
        fileUrl = await saveFileS3(
          fileFile,
          `lessons/${lesson.courseId}/assignments/`,
        );
        assignment.fileUrl = fileUrl;
      }

      console.log('fileUrl======', fileUrl);

      if (dto.title) {
        assignment.title = dto.title;
      }

      if (dto.description) {
        assignment.description = dto.description;
      }

      course.status = CourseStatus.PENDING;
      await this.lessonRepo.save(lesson);
      await this.courseRepo.save(course);
      await this.assignmentRepo.save(assignment);

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
        error.statusCOde || 500,
      );
    }
  }

  //   // 📌 Delete assignment
  /**
   Delete a assignment
      */
  async deleteAssignment(assignmentId: string, req: CustomRequest) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['instructor', 'lesson'],
    });

    if (!assignment) throw customError.notFound('Assignment not found');
    if (assignment.instructorId !== req.userId) {
      throw customError.forbidden('You can only delete assignment you created');
    }

    try {
      if (assignment.fileUrl) {
        try {
          await deleteFileS3(assignment.fileUrl);
        } catch (err) {
          console.warn(' Failed to delete old video:', err.message);
        }
      }

      await this.assignmentRepo.remove(assignment);

      const instructor = assignment.instructor;
      await this.emailService.AssignmentDeletion(
        instructor.email,
        instructor.firstName,
        assignment.title,
        assignment.lesson.title,
      );

      return {
        accessToken: req.token,
        message: 'Assignment deleted successfully',
      };
    } catch (error) {
      console.log(error);
      throw customError.internalServerError(
        error.message || '',
        error.statusCOde || 500,
      );
    }
  }

  /**
   * Get all assignments in a course
   */
  async getAssignmentsInCourse(
    courseId: string,
    query: QueryString,
    req: CustomRequest,
  ) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, deleted: false },
      relations: ['instructor'],
    });

    if (!course) throw customError.notFound('Course not found');
    if (course.instructor.id !== req.userId) {
      throw customError.forbidden(
        'You can only view assignments from your own course',
      );
    }

    const baseQuery = this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.instructor', 'instructor')
      .where('course.id = :courseId', { courseId });

    const dbQuery = new DBQuery(baseQuery, 'assignment', query);

    dbQuery.filter().sort().limitFields().paginate();

    const [assignments, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      assignments,
      message: 'Assignments fetched successfully',
    };
  }

  /**
   * Get all assignments by instructor
   */
  async getAssignmentsByInstructor(
    instructorId: string,
    query: QueryString,
    req: CustomRequest,
  ) {
    if (req.userId !== instructorId) {
      throw customError.forbidden('You can only view your own assignments');
    }

    const baseQuery = this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.course', 'course')
      .leftJoinAndSelect('assignment.instructor', 'instructor')
      .where('assignment.instructorId = :instructorId', { instructorId });

    const dbQuery = new DBQuery(baseQuery, 'assignment', query);

    dbQuery.filter().sort().limitFields().paginate();

    const [assignments, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      assignments,
      message: 'Assignments fetched successfully',
    };
  }
}
