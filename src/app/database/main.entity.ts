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
import { Assignment } from '../assignment/assignment.entity';

export enum AssignmentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Course, (course) => course.category)
  courses?: Course[];
}

@Entity({ name: 'enrollments' })
export class Enrollment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.enrollments, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Course, (course) => course.enrollments, { nullable: false })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ default: 'active' })
  status!: string;

  @OneToMany(() => Submission, (s) => s.enrollment)
  submissions?: Submission[];

  @CreateDateColumn()
  createdAt!: Date;
}

@Entity({ name: 'submissions' })
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Assignment, (a) => a.submissions, { nullable: false })
  @JoinColumn({ name: 'assignment_id' })
  assignment!: Assignment;

  @ManyToOne(() => Enrollment, (e) => e.submissions, { nullable: false })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'int', nullable: true })
  grade?: number;

  @Column({ type: 'timestamptz' })
  submittedAt!: Date;
}
