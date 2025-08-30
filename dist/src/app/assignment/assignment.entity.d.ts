import { BaseEntity } from 'typeorm';
import { Lesson } from '../lesson/lesson.entity';
import { Submission } from '../submission/submission.entity';
import { User } from '../user/user.entity';
export declare class Assignment extends BaseEntity {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    lesson: Lesson;
    lessonId: string;
    instructor: User;
    instructorId: string;
    submissions?: Submission[];
    createdAt: Date;
    updatedAt: Date;
}
