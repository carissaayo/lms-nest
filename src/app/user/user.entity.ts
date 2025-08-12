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
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Course } from '../course/course.entity';
import { Enrollment } from '../database/main.entity';
import { Transaction } from '../transaction/transaction.entity';
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
  @Column({ nullable: true })
  phone?: string;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  @OneToMany(() => Course, (course) => course.instructor)
  courses?: Course[];

  @OneToMany(() => Enrollment, (enr) => enr.user)
  enrollments?: Enrollment[];

  @OneToMany(() => Transaction, (t) => t.user)
  transactions?: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
