import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  JoinColumn,
} from 'typeorm';
import { Assignment } from '../assignment/assignment.entity';
import { Enrollment } from '../database/main.entity';

@Entity({ name: 'submissions' })
export class Submission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assignment_id' })
  assignment!: Assignment;

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.submissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: Enrollment;

  @Column({ nullable: false })
  fileUrl!: string;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'int', nullable: true })
  grade?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
