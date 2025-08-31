import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { customError } from 'src/libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import { Lesson } from '../lesson.entity';
import { Course, CourseStatus } from 'src/app/course/course.entity';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';
import {
  deleteFileS3,
  deleteImageS3,
  saveFileS3,
} from 'src/app/fileUpload/image-upload.service';
import { User } from 'src/app/user/user.entity';
import { EmailService } from 'src/app/email/email.service';
import { DBQuery, QueryString } from 'src/app/database/dbquery';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create a new lesson under a course
   */
  async createLesson(
    dto: CreateLessonDTO,
    files: { video?: Express.Multer.File[]; note?: Express.Multer.File[] },
    req: CustomRequest,
  ) {
    const { courseId } = dto;
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

    let videoUrl: string | undefined = undefined;
    let noteUrl: string | undefined = undefined;

    try {
      console.log('files======', files);

      //   // Upload files to S3
      if (files.video && files.video.length > 0) {
        const videoFile = files.video[0];
        videoUrl = await saveFileS3(videoFile, `lessons/${courseId}/videos/`);
      }

      if (files.note && files.note.length > 0) {
        const noteFile = files.note[0];
        noteUrl = await saveFileS3(noteFile, `lessons/${courseId}/notes/`);
      }
      console.log('videoUrl======', videoUrl);
      console.log('noteUrl======', noteUrl);

      const lastLesson = await this.lessonRepo.findOne({
        where: { course: { id: dto.courseId } },
        order: { position: 'DESC' },
      });
      const nextPosition = lastLesson ? lastLesson.position + 1 : 1;
      //   // Create lesson entity
      const lesson = this.lessonRepo.create({
        ...dto,
        videoUrl,
        noteUrl,
        course: { id: courseId },
        position: nextPosition,
      });
      course.status = CourseStatus.PENDING;

      await this.lessonRepo.save(lesson);
      await this.courseRepo.save(course);

      await this.emailService.LessonCreation(
        instructor.email,
        instructor.firstName,
        course.title,
        lesson.title,
      );

      return {
        accessToken: req.token,
        message: 'Lesson has been created successfully',
        lesson,
        course,
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
   * Update a lesson
   */
  async updateLesson(
    dto: UpdateLessonDTO,
    files: { video?: Express.Multer.File[]; note?: Express.Multer.File[] },
    req: CustomRequest,
    lessonId: string,
  ) {
    console.log('lessonId===', lessonId);

    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw customError.notFound('Lesson not found');
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

    const course = await this.courseRepo.findOne({
      where: { id: lesson.courseId },
      relations: ['instructor', 'category'],
    });

    if (!course) {
      throw customError.notFound('Course not found');
    }

    if (course.instructor.id !== req.userId) {
      throw customError.forbidden('You can only update your  course');
    }

    let videoUrl: string | undefined = undefined;
    let noteUrl: string | undefined = undefined;

    try {
      console.log('files======', files);

      //   // Upload files to S3
      if (files && files.video && files.video.length > 0) {
        if (lesson.videoUrl) {
          try {
            await deleteFileS3(lesson.videoUrl);
          } catch (err) {
            console.warn(' Failed to delete old video:', err.message);
          }
        }
        const videoFile = files.video[0];
        videoUrl = await saveFileS3(
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
            console.warn(' Failed to delete old note:', err.message);
          }
        }
        const noteFile = files.note[0];
        noteUrl = await saveFileS3(
          noteFile,
          `lessons/${lesson.courseId}/notes/`,
        );
        lesson.noteUrl = noteUrl;
      }
      console.log('videoUrl======', videoUrl);
      console.log('noteUrl======', noteUrl);

      if (dto.title) {
        lesson.title = dto.title;
      }

      if (dto.description) {
        lesson.description = dto.description;
      }

      course.status = CourseStatus.PENDING;
      await this.lessonRepo.save(lesson);
      await this.courseRepo.save(course);

      await this.emailService.LessonUpdating(
        instructor.email,
        instructor.firstName,
        course.title,
        lesson.title,
      );

      return {
        accessToken: req.token,
        message: 'Lesson has been updated successfully',
        lesson,
        course,
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
   Delete a lesson
      */
  async deleteLesson(lessonId: string, req: CustomRequest) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['course', 'course.instructor'],
    });

    if (!lesson) throw customError.notFound('Lesson not found');
    if (lesson.course.instructor.id !== req.userId) {
      throw customError.forbidden(
        'You can only delete lessons from your own course',
      );
    }

    try {
      if (lesson.videoUrl) {
        try {
          await deleteFileS3(lesson.videoUrl);
        } catch (err) {
          console.warn(' Failed to delete old video:', err.message);
        }
      }
      if (lesson.noteUrl) {
        try {
          await deleteFileS3(lesson.noteUrl);
        } catch (err) {
          console.warn(' Failed to delete old note:', err.message);
        }
      }

      await this.lessonRepo.remove(lesson);
      const instructor = lesson.course.instructor;
      await this.emailService.LessonDeletion(
        instructor.email,
        instructor.firstName,
        lesson.title,
        lesson.course.title,
      );

      return {
        accessToken: req.token,
        message: 'Lesson deleted successfully',
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
   * Get all lessons in a course
   */
  async getLessons(courseId: string, query: QueryString, req: CustomRequest) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, deleted: false },
      relations: ['instructor'],
    });

    if (!course) throw customError.notFound('Course not found');
    if (course.instructor.id !== req.userId) {
      throw customError.forbidden(
        'You can only view lessons from your own course',
      );
    }

    const baseQuery = this.lessonRepo
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .leftJoinAndSelect('lesson.assignments', 'assignments')
      .where('course.id = :courseId', { courseId });

    const dbQuery = new DBQuery(baseQuery, 'lesson', query);

    dbQuery.filter().sort().limitFields().paginate();

    if (!query.sort) {
      dbQuery.query.addOrderBy('lesson.position', 'ASC');
    }

    const [lessons, total] = await Promise.all([
      dbQuery.getMany(),
      dbQuery.count(),
    ]);

    return {
      accessToken: req.token,
      page: dbQuery.page,
      results: total,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }

  // async reorderLessons(
  //   courseId: string,
  //   newOrder: { lessonId: number; position: number }[],
  //   req: CustomRequest,
  // ) {
  //   const course = await this.courseRepo.findOne({
  //     where: { id: courseId },
  //     relations: ['instructor'],
  //   });

  //   if (!course) throw customError.notFound('Course not found');
  //   if (course.instructor.id !== req.userId) {
  //     throw customError.forbidden(
  //       'You can only reorder lessons in your own course',
  //     );
  //   }

  //   for (const { lessonId, position } of newOrder) {
  //     await this.lessonRepo.update(
  //       { id: lessonId, course: { id: courseId } },
  //       { position },
  //     );
  //   }

  //   const updatedLessons = await this.lessonRepo.find({
  //     where: { course: { id: courseId } },
  //     order: { position: 'ASC' },
  //   });

  //   return {
  //     lessons: updatedLessons,
  //     message: 'Lessons reordered successfully',
  //   };
  // }
}
