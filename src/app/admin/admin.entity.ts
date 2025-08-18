import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

import * as bcrypt from 'bcryptjs';
import { UserRole } from '../user/user.entity';

export enum AdminStatus {
  PENDING = 'pending',
  APPPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('user_admins')
export class UserAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName!: string;
  @Column()
  lastName!: string;
  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  state: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role!: UserRole;
  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  password!: string;
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

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column('text', { array: true, default: [] })
  permissions: string[];

  @Column({ type: 'timestamp', nullable: true })
  signUpDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ default: false })
  signedUp: boolean;

  @Column({ type: 'jsonb', nullable: true })
  sessions: any[];

  @Column({ default: 0 })
  failedSignInAttempts: number;
  @Column({
    type: 'enum',
    enum: AdminStatus,
    default: AdminStatus.PENDING,
  })
  status!: string;

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

  @Column({ type: 'timestamp', nullable: true })
  nextSignInAttempt: Date | null;

  @Column({ type: 'boolean', default: false })
  isSignedUp: boolean;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'jsonb', default: [] })
  actions: any[];

  @Column({ default: false })
  deleted: boolean;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  async hasNewPassword(newPassword: string) {
    this.password = await bcrypt.hash(newPassword, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
