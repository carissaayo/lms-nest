import { BaseEntity } from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from '../database/main.entity';
import { Lesson } from '../lesson/lesson.entity';
import { UserAdmin } from '../admin/admin.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
export declare enum CourseStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare class Course extends BaseEntity {
    id: string;
    title: string;
    description: string;
    instructor: User;
    instructorId: string;
    instructorName: string;
    category: Category;
    categoryId: string;
    categoryName: string;
    lessons?: Lesson[];
    enrollments?: Enrollment[];
    coverImage: string;
    status: string;
    isApproved: boolean;
    isPublished: boolean;
    publishedAt?: Date;
    approvedBy?: UserAdmin;
    approvedByName?: string;
    rejectedBy?: UserAdmin;
    rejectedByName?: string;
    rejectReason?: string;
    approvalDate?: Date;
    rejectionDate?: Date;
    isSubmitted: boolean;
    suspendedBy?: UserAdmin;
    suspendedByName?: string;
    suspensionDate?: Date;
    suspendReason?: string;
    submittedAt?: Date;
    price: number;
    deleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
