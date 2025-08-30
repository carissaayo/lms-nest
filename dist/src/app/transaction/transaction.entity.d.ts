import { BaseEntity } from 'typeorm';
import { User } from '../user/user.entity';
export declare class Transaction extends BaseEntity {
    id: string;
    user: User;
    amount: number;
    status: string;
    createdAt: Date;
}
