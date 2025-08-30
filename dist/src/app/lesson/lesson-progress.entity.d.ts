import { BaseEntity } from 'typeorm';
import { User } from '../user/user.entity';
import { Lesson } from '../lesson/lesson.entity';
export declare enum LessonStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed"
}
export declare class LessonProgress extends BaseEntity {
    id: string;
    user: User;
    lesson: Lesson;
    status: LessonStatus;
    watchedDuration: number;
    completed: boolean;
    startedAt: Date;
    updatedAt: Date;
}
