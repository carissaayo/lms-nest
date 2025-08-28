import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BaseEntity,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';

@Entity({ name: 'payments' })
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (u) => u.payments, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student!: User;

  @ManyToOne(() => Course, (c) => c.price, { nullable: false })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ default: 'paystack' })
  provider!: string;

  @Column()
  reference!: string;

  @Column({ default: 'success' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
