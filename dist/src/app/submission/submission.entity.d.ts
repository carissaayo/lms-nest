import { BaseEntity } from 'typeorm';
import { Assignment } from '../assignment/assignment.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
export declare class Submission extends BaseEntity {
    id: number;
    assignment: Assignment;
    enrollment: Enrollment;
    fileUrl: string;
    feedback?: string;
    grade?: number;
    createdAt: Date;
    updatedAt: Date;
}
