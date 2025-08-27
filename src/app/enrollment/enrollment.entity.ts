import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Course } from '../course/course.entity';
import { User } from '../user/user.entity';
import { Submission } from '../submission/submission.entity';

@Entity({ name: 'enrollments' })
export class Enrollment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ default: 'active' })
  status!: string;

  @Column()
  paymentReference: string;
  @OneToMany(() => Submission, (s) => s.enrollment, { cascade: true })
  submissions?: Submission[];

  @CreateDateColumn()
  createdAt!: Date;
}
