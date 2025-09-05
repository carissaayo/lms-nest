import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
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

  @Prop()
  emailCode: string;

  @Prop()
  passwordResetCode: string;

  @Prop()
  resetPasswordExpires: Date;

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

  @Prop()
  createdAt: Date;

  @Prop()
  lastSeen: Date;

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

// Add password hashing middleware
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const bcrypt = await import('bcryptjs');
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Add instance methods
UserSchema.methods.hasNewPassword = async function (newPassword: string) {
  const bcrypt = await import('bcryptjs');
  this.password = await bcrypt.hash(newPassword, 10);
};

UserSchema.methods.validatePassword = async function (password: string) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, this.password);
};
