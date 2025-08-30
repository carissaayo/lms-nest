import { BaseEntity } from 'typeorm';
import { User } from '../../user/user.entity';
import { Course } from '../../course/course.entity';
import { Payment } from 'src/app/payment/payment.entity';
export declare class Earning extends BaseEntity {
    id: string;
    instructor: User;
    course: Course;
    payment: Payment;
    amount: number;
    platformShare: number;
    createdAt: Date;
}
