import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { User } from 'src/app/user/user.entity';
import { Withdrawal } from './withdrawal.entity';

@Entity({ name: 'otps' })
export class Otp extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Withdrawal, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'withdrawal_id' })
  withdrawal?: Withdrawal;

  @Column({})
  code!: string;

  @Column({ type: 'boolean', default: false })
  consumed!: boolean;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
