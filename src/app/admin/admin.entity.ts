import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

import * as bcrypt from 'bcryptjs';

@Entity('user_admins')
export class UserAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  otherName: string;

  @Column({ nullable: true })
  alias: string;

  @Column({ nullable: true })
  orgName: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

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

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailCode: string;

  @Column({ nullable: true })
  passwordResetCode: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextSignInAttempt: Date;

  @Column({ type: 'jsonb', default: [] })
  actions: any[];

  @Column({ default: false })
  deleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
