import { BaseEntity } from 'typeorm';
import { Course } from '../course/course.entity';
import { Transaction } from '../transaction/transaction.entity';
import { UserRole } from './user.interface';
import { Assignment } from '../assignment/assignment.entity';
import { Enrollment } from '../enrollment/enrollment.entity';
import { LessonProgress } from '../lesson/lesson-progress.entity';
import { Payment } from '../payment/payment.entity';
import { Earning } from '../instructor/entities/earning.entity';
import { Bank } from '../instructor/entities/bank.entity';
export declare enum UserStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class User extends BaseEntity {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    hashPassword(): Promise<void>;
    hasNewPassword(newPassword: string): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    phoneNumber: string;
    emailVerified: boolean;
    emailCode: string | null;
    passwordResetCode?: string | null;
    resetPasswordExpires: Date | null;
    isActive: boolean;
    role: UserRole;
    courses?: Course[];
    enrollments?: Enrollment[];
    transactions?: Transaction[];
    assignments?: Assignment[];
    status: UserStatus;
    sessions: any[];
    failedSignInAttempts: number;
    nextSignInAttempt: Date | null;
    walletBalance: number;
    createdAt: Date;
    lastSeen?: Date;
    updatedAt: Date;
    nextAuthDate?: Date;
    failedAuthAttempts: number;
    nextPasswordResetDate?: Date;
    failedPasswordResetAttempts: number;
    nextEmailVerifyDate?: Date;
    failedEmailVerifyAttempts: number;
    isSignedUp: boolean;
    actions: any[];
    lessonProgress: LessonProgress[];
    payments: Payment[];
    earnings: Earning[];
    banks: Bank[];
}
