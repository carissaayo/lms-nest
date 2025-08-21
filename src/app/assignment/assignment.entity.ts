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
import { Submission } from '../submission/submission.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'assignments' })
export class Assignment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  fileUrl!: string;

  @ManyToOne(() => Lesson, (lesson) => lesson.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson!: Lesson;

  @Column()
  lessonId!: string;

  @ManyToOne(() => User, (user) => user.assignments, { nullable: false })
  @JoinColumn({ name: 'instructor_id' })
  instructor!: User;
  @Column()
  instructorId!: string;

  @OneToMany(() => Submission, (s) => s.enrollment, { cascade: true })
  submissions?: Submission[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
