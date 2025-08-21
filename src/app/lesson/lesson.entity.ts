import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Course } from '../course/course.entity';
import { Assignment } from '../assignment/assignment.entity';

@Entity({ name: 'lessons' })
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', default: 1 })
  position!: number;

  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
  course: Course;

  @OneToMany(() => Assignment, (a) => a.lesson)
  assignments?: Assignment[];

  @Column()
  courseId: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: false })
  videoUrl: string;

  @Column({ nullable: true })
  noteUrl?: string;
}
