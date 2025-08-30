import { User } from 'src/app/user/user.entity';
import { BaseEntity } from 'typeorm';
export declare enum withdrawalStatus {
    PENDING = "pending",
    FAILED = "failed",
    SUCCESSFUL = "successful"
}
export declare class Withdrawal extends BaseEntity {
    id: string;
    user: User;
    amount: number;
    status: withdrawalStatus;
    createdAt: Date;
    bankId: string;
}
