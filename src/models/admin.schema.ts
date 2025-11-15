import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  HydratedDocument,
  Model,
  Schema as MongooseSchema,
} from 'mongoose';
import { PermissionsEnum } from 'src/app/admin/admin.interface';
import { UserRole } from 'src/app/user/user.interface';


export enum AdminStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED="suspended"
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

  @Prop({ enum: UserRole, default: UserRole.ADMIN, type: String })
  role: UserRole;

  @Prop()
  city: string;

  @Prop()
  street: string;



  @Prop()
  coumntry: string;

  @Prop()
  picture: string;

  @Prop()
  bio: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  password: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: String })
  emailCode: string | null;

  @Prop({ type: String })
  passwordResetCode: string | null;

  @Prop({ type: Date })
  resetPasswordExpires: Date | null;

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

  @Prop({ type: String, enum: AdminStatus, default: AdminStatus.PENDING })
  status: AdminStatus;

  @Prop()
  updatedAt: Date;

  @Prop()
  nextAuthDate: Date;
  @Prop({ type: Date })
  lockUntil?: Date;

  @Prop({ type: Date })
  lastLogin?: Date;

  @Prop({ default: 0 })
  failedAuthAttempts: number;

  @Prop({ type: Date })
  nextPasswordResetDate: Date;

  @Prop({ default: 0 })
  failedPasswordResetAttempts: number;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop()
  nextEmailVerifyDate: Date;

  @Prop({ default: 0 })
  failedEmailVerifyAttempts: number;

  @Prop()
  nextSignInAttempt: Date;

  @Prop({ default: false })
  isSignedUp: boolean;

  @Prop({ type: Date })
  passwordResetExpires: Date | null;

  @Prop({ type: [Object], default: [] })
  actions: any[];

  @Prop({ default: false })
  deleted: boolean;
}

export const UserAdminSchema = SchemaFactory.createForClass(UserAdmin);

export type UserAdminDocument = HydratedDocument<UserAdmin>;
