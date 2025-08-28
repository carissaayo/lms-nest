import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { User } from '../../user/user.entity';
import { Course } from '../../course/course.entity';
import { Payment } from 'src/app/payment/payment.entity';

@Entity({ name: 'earnings' })
export class Earning extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.earnings, { nullable: false })
  @JoinColumn({ name: 'instructor_id' })
  instructor!: User;

  @ManyToOne(() => Course, (c) => c.price, { nullable: false })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @ManyToOne(() => Payment, (p) => p.amount, { nullable: false })
  @JoinColumn({ name: 'payment_id' })
  payment!: Payment;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  platformShare!: number;
  @CreateDateColumn()
  createdAt!: Date;
}
