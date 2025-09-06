import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from '../models/main.schema';
import { Lesson } from '../lesson/lesson.entity';
import { UserAdmin } from '../admin/admin.entity';
import { Enrollment } from '../enrollment/enrollment.entity';

export enum CourseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity({ name: 'courses' })
export class Course extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @ManyToOne(() => User, (user) => user.courses, { nullable: false })
  @JoinColumn({ name: 'instructor_id' })
  instructor!: User;
  @Column({ name: 'instructor_id', type: 'uuid' })
  instructorId!: string;
  @Column({})
  instructorName!: string;
  @ManyToOne(() => Category, (c) => c.courses, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
  @Column()
  categoryId!: string;
  @Column()
  categoryName!: string;
  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons?: Lesson[];

  @OneToMany(() => Enrollment, (enr) => enr.course)
  enrollments?: Enrollment[];

  @Column()
  coverImage!: string;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.PENDING,
  })
  status!: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isPublished: boolean;
  @CreateDateColumn({ nullable: true })
  publishedAt?: Date;
  @ManyToOne(() => UserAdmin, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: UserAdmin;

  @Column({ nullable: true })
  approvedByName?: string;

  @ManyToOne(() => UserAdmin, { nullable: true })
  @JoinColumn({ name: 'rejected_by' })
  rejectedBy?: UserAdmin;

  @Column({ nullable: true })
  rejectedByName?: string;

  @Column({ nullable: true })
  rejectReason?: string;
  @Column({ type: 'timestamp', nullable: true })
  approvalDate?: Date;
  @Column({ type: 'timestamp', nullable: true })
  rejectionDate?: Date;
  @Column({ default: false })
  isSubmitted: boolean;

  @ManyToOne(() => UserAdmin, { nullable: true })
  @JoinColumn({ name: 'suspended_by' })
  suspendedBy?: UserAdmin;
  @Column({ nullable: true })
  suspendedByName?: string;
  @Column({ type: 'timestamp', nullable: true })
  suspensionDate?: Date;
  @Column({ nullable: true })
  suspendReason?: string;
  @CreateDateColumn({ nullable: true })
  submittedAt?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
