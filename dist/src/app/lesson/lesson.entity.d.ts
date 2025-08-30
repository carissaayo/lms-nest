import { BaseEntity } from 'typeorm';
import { Course } from '../course/course.entity';
import { Assignment } from '../assignment/assignment.entity';
import { LessonProgress } from './lesson-progress.entity';
export declare class Lesson extends BaseEntity {
    id: string;
    title: string;
    description?: string;
    position: number;
    course: Course;
    assignments?: Assignment[];
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
    videoUrl: string;
    noteUrl?: string;
    progress: LessonProgress[];
}
