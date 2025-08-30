import { User } from 'src/app/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';

export enum withdrawalStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  SUCCESSFUL = 'successful',
}
@Entity({ name: 'withdrawals' })
export class Withdrawal extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.transactions, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({
    type: 'enum',
    enum: withdrawalStatus,
    default: withdrawalStatus.PENDING,
  })
  status!: withdrawalStatus;

  @CreateDateColumn()
  createdAt!: Date;
  @Column({ nullable: false })
  bankId!: string;
}
