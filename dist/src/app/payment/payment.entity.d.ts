import { BaseEntity } from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';
export declare class Payment extends BaseEntity {
    id: string;
    student: User;
    course: Course;
    amount: number;
    provider: string;
    reference: string;
    status: string;
    createdAt: Date;
}
