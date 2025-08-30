import { BaseEntity } from 'typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Submission } from '../submission/submission.entity';
export declare class Enrollment extends BaseEntity {
    id: number;
    user: User;
    course: Course;
    status: string;
    paymentReference: string;
    submissions?: Submission[];
    createdAt: Date;
}
