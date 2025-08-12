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
import { Lesson } from '../lesson/lesson.entity';
import { Submission } from '../database/main.entity';
@Entity({ name: 'assignments' })
export class Assignment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments, { nullable: true })
  @JoinColumn({ name: 'lesson_id' })
  lesson?: Lesson;

  @OneToMany(() => Submission, (s) => s.assignment)
  submissions?: Submission[];

  @Column({ type: 'timestamptz', nullable: true })
  dueDate?: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
