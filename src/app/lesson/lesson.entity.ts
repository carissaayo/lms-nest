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
import { Course } from '../course/course.entity';
import { Assignment } from '../assignment/assignment.entity';

@Entity({ name: 'lessons' })
export class Lesson extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  content?: string; // could be markdown, html, or an external url

  @ManyToOne(() => Course, (course) => course.lessons, { nullable: false })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @OneToMany(() => Assignment, (a) => a.lesson)
  assignments?: Assignment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
