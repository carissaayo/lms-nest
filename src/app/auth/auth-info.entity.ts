// auth-info.embedded.ts
import { Column } from 'typeorm';

export class AuthInfo {
  @Column({ type: 'timestamp', nullable: true })
  nextAuthDate?: Date;

  @Column({ type: 'int', default: 0 })
  failedAuthAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  nextPasswordResetDate?: Date;

  @Column({ type: 'int', default: 0 })
  failedPasswordResetAttempts: number;

  @Column({ type: 'varchar', nullable: true })
  passwordResetCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  nextEmailVerifyDate?: Date;

  @Column({ type: 'int', default: 0 })
  failedEmailVerifyAttempts: number;

  @Column({ type: 'varchar', nullable: true })
  emailVerifyCode?: string;

  @Column({ type: 'boolean', default: false })
  isSignedUp: boolean;
}
