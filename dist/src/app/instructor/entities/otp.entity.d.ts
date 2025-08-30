import { BaseEntity } from 'typeorm';
import { User } from 'src/app/user/user.entity';
import { Withdrawal } from './withdrawal.entity';
export declare class Otp extends BaseEntity {
    id: string;
    user: User;
    withdrawal?: Withdrawal;
    code: string;
    consumed: boolean;
    expiresAt: Date;
    createdAt: Date;
}
