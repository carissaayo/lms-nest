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
import { Category, Enrollment } from '../database/main.entity';
import { Lesson } from '../lesson/lesson.entity';

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

  @ManyToOne(() => Category, (c) => c.courses, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons?: Lesson[];

  @OneToMany(() => Enrollment, (enr) => enr.course)
  enrollments?: Enrollment[];

  @Column()
  coverImage!: string;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy?: User;

  @Column({ type: 'timestamp', nullable: true })
  approvalDate?: Date;

  @Column({ default: false })
  isSubmitted: boolean;

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
