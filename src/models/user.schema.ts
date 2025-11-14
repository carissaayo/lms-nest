import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { UserRole } from 'src/app/user/user.interface';

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED= 'suspended',
}

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: String })
  emailCode: string | null;

  @Prop({ type: String })
  state: string | null;
  @Prop({ type: String })
  city: string | null;
  @Prop({ type: String })
  country: string | null;
  @Prop({ type: String })
  street: string | null;
  @Prop({ type: String })
  picture: string | null;

  @Prop({ type: String })
  bio: string | null;

  @Prop({ type: String })
  passwordResetCode: string | null;

  @Prop({ type: Date })
  resetPasswordExpires: Date | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ type: [Object], default: [] })
  sessions: any[];

  @Prop({ default: 0 })
  failedSignInAttempts: number;

  @Prop()
  nextSignInAttempt: Date;

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  lastSeen: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
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

  @Prop({ type: Date })
  nextEmailVerifyDate: Date;

  @Prop({ default: 0 })
  failedEmailVerifyAttempts: number;

  @Prop({ default: 0 })
  failedLoginAttempts: number;

  @Prop({ default: false })
  isSignedUp: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [Object], default: [] })
  actions: any[];

  @Prop()
  suspendReason?: string;

  @Prop()
  suspensionDate?: Date;
  @Prop()
  suspendedByName?: string;
  @Prop()
  suspendedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  rejectedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  rejectedByName?: string;

  @Prop()
  rejectReason?: string;

  @Prop()
  rejectionDate?: Date;

  @Prop()
  approvalDate?: Date;

  @Prop()
  approvedByName?: string;

  @Prop()
  approvedBy?: MongooseSchema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Now merge methods into document
export type UserDocument = HydratedDocument<User>;
