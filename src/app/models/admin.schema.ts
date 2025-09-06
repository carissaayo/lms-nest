import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { UserRole } from '../user/user.interface';
import { PermissionsEnum } from '../admin/admin.interface';

export enum AdminStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class UserAdmin extends Document {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  state: string;

  @Prop({ enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @Prop()
  city: string;

  @Prop()
  address: string;

  @Prop()
  picture: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailCode: string | null;

  @Prop()
  passwordResetCode: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ type: [String], enum: PermissionsEnum, default: [] })
  permissions: PermissionsEnum[];

  @Prop()
  signUpDate: Date;

  @Prop()
  lastSeen: Date;

  @Prop({ default: false })
  signedUp: boolean;

  @Prop({ type: [Object], default: [] })
  sessions: any[];

  @Prop({ default: 0 })
  failedSignInAttempts: number;

  @Prop({ enum: AdminStatus, default: AdminStatus.PENDING })
  status: string;

  @Prop()
  updatedAt: Date;

  @Prop()
  nextAuthDate: Date;

  @Prop({ default: 0 })
  failedAuthAttempts: number;

  @Prop()
  nextPasswordResetDate: Date;

  @Prop({ default: 0 })
  failedPasswordResetAttempts: number;

  @Prop()
  nextEmailVerifyDate: Date;

  @Prop({ default: 0 })
  failedEmailVerifyAttempts: number;

  @Prop()
  nextSignInAttempt: Date;

  @Prop({ default: false })
  isSignedUp: boolean;

  @Prop()
  passwordResetExpires: Date;

  @Prop({ type: [Object], default: [] })
  actions: any[];

  @Prop({ default: false })
  deleted: boolean;
}

export type UserAdminDocument = HydratedDocument<UserAdmin>;

export const UserAdminSchema = SchemaFactory.createForClass(UserAdmin);
export interface UserAdminMethods {
  hasNewPassword(newPassword: string): Promise<void>;
  validatePassword(password: string): Promise<boolean>;
}
// Add password hashing middleware
UserAdminSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add instance methods
UserAdminSchema.methods.hasNewPassword = async function (newPassword: string) {
  const bcrypt = await import('bcryptjs');
  this.password = await bcrypt.hash(newPassword, 10);
};

UserAdminSchema.methods.validatePassword = async function (
  password: string,
): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, this.password);
};
