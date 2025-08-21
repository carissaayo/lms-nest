import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Course } from '../course/course.entity';

import { Transaction } from '../transaction/transaction.entity';
import { UserRole } from './user.interface';
import { Enrollment } from '../database/main.entity';
import { Assignment } from '../assignment/assignment.entity';

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async hasNewPassword(newPassword: string) {
    this.password = await bcrypt.hash(newPassword, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  @Column()
  phoneNumber!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordResetCode?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;

  @OneToMany(() => Course, (course) => course.instructor)
  courses?: Course[];

  @OneToMany(() => Enrollment, (enrollment: Enrollment) => enrollment.user)
  enrollments?: Enrollment[];

  @OneToMany(() => Transaction, (t) => t.user)
  transactions?: Transaction[];

  @OneToMany(() => Assignment, (assignment) => assignment.instructor)
  assignments?: Assignment[];

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  sessions: any[];

  @Column({ type: 'int', default: 0 })
  failedSignInAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  nextSignInAttempt: Date | null;

  @Column({ type: 'int', default: 0 })
  walletBalance: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextAuthDate?: Date;

  @Column({ type: 'int', default: 0 })
  failedAuthAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  nextPasswordResetDate?: Date;

  @Column({ type: 'int', default: 0 })
  failedPasswordResetAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  nextEmailVerifyDate?: Date;

  @Column({ type: 'int', default: 0 })
  failedEmailVerifyAttempts: number;

  @Column({ type: 'boolean', default: false })
  isSignedUp: boolean;

  @Column({ type: 'jsonb', default: [] })
  actions: any[];
}
