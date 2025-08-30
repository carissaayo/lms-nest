import { BaseEntity } from 'typeorm';
import { Course } from '../course/course.entity';
export declare enum AssignmentStatus {
    PENDING = "pending",
    SUBMITTED = "submitted",
    GRADED = "graded"
}
export declare class Category extends BaseEntity {
    id: string;
    name: string;
    courses?: Course[];
}
