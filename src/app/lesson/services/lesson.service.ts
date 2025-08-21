import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { customError } from 'libs/custom-handlers';
import { CustomRequest } from 'src/utils/auth-utils';
import { Lesson } from '../lesson.entity';
import { Course } from 'src/app/course/course.entity';
import { CreateLessonDTO, UpdateLessonDTO } from '../lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  /**
   * Create a new lesson under a course
   */
  async createLesson(dto: CreateLessonDTO, req: CustomRequest) {
    const { courseId, title, content, position } = dto;

    const course = await this.courseRepo.findOne({
      where: { id: courseId, deleted: false },
      relations: ['instructor', 'lessons'],
    });

    if (!course) throw customError.notFound('Course not found');
    if (course.instructor.id !== req.userId) {
      throw customError.forbidden(
        'You can only add lessons to your own course',
      );
    }

    // If no position is given, put it at the end
    let finalPosition = position;
    if (!finalPosition) {
      const lastLesson = course.lessons?.sort(
        (a, b) => b.position - a.position,
      )[0];
      finalPosition = lastLesson ? lastLesson.position + 1 : 1;
    }

    const lesson = this.lessonRepo.create({
      title,
      content,
      position: finalPosition,
      course,
    });

    await this.lessonRepo.save(lesson);

    return {
      lesson,
      message: 'Lesson created successfully',
    };
  }

  /**
   * Update a lesson
   */
  async updateLesson(
    lessonId: number,
    dto: UpdateLessonDTO,
    req: CustomRequest,
  ) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['course', 'course.instructor'],
    });

    if (!lesson) throw customError.notFound('Lesson not found');
    if (lesson.course.instructor.id !== req.userId) {
      throw customError.forbidden(
        'You can only update lessons in your own course',
      );
    }

    if (dto.title) lesson.title = dto.title;
    if (dto.content) lesson.content = dto.content;
    if (dto.position) lesson.position = dto.position;

    await this.lessonRepo.save(lesson);

    return {
      lesson,
      message: 'Lesson updated successfully',
    };
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(lessonId: number, req: CustomRequest) {
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

    await this.lessonRepo.remove(lesson);

    return {
      message: 'Lesson deleted successfully',
    };
  }

  /**
   * Get all lessons in a course
   */
  async getLessons(courseId: string, req: CustomRequest) {
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

    const lessons = await this.lessonRepo.find({
      where: { course: { id: courseId } },
      order: { position: 'ASC' }, // always ordered
    });

    return {
      courseId,
      lessons,
      message: 'Lessons fetched successfully',
    };
  }

  async reorderLessons(
    courseId: string,
    newOrder: { lessonId: number; position: number }[],
    req: CustomRequest,
  ) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    if (!course) throw customError.notFound('Course not found');
    if (course.instructor.id !== req.userId) {
      throw customError.forbidden(
        'You can only reorder lessons in your own course',
      );
    }

    for (const { lessonId, position } of newOrder) {
      await this.lessonRepo.update(
        { id: lessonId, course: { id: courseId } },
        { position },
      );
    }

    const updatedLessons = await this.lessonRepo.find({
      where: { course: { id: courseId } },
      order: { position: 'ASC' },
    });

    return {
      lessons: updatedLessons,
      message: 'Lessons reordered successfully',
    };
  }
}
