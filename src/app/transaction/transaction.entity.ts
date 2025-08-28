import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from '../user/user.entity';
@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.transactions, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
