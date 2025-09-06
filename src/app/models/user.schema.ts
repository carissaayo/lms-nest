import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserRole } from '../user/user.interface';

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
  passwordResetCode: string | null;

  @Prop({ type: Date })
  resetPasswordExpires: Date | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }])
  courses: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Enrollment' }])
  enrollments: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Transaction' }])
  transactions: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Assignment' }])
  assignments: string[];

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

  @Prop({ default: false })
  isSignedUp: boolean;

  @Prop({ type: [Object], default: [] })
  actions: any[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'LessonProgress' }])
  lessonProgress: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Payment' }])
  payments: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Earning' }])
  earnings: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Bank' }])
  banks: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Now merge methods into document
export type UserDocument = HydratedDocument<User>;
