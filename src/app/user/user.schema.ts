// src/user/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../domain/enums/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  courses: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  completedLectures: Record<string, any>;

  @Prop({ type: Object, default: {} })
  progress: Record<string, any>;

  @Prop({
    type: {
      url: { type: String },
    },
    default: {},
  })
  avatar: {
    url?: string;
  };

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isAdmin: boolean;
  @Prop({ required: true, enum: Role, default: Role.STUDENT })
  role: Role;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Course' }], default: [] })
  enrolledCourses: Types.ObjectId[];

  @Prop({
    type: [
      {
        quizzId: { type: Types.ObjectId, ref: 'Quizz' },
        totalScore: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  quizz: {
    quizzId: Types.ObjectId;
    totalScore: number;
  }[];

  @Prop({
    type: [
      {
        type: Types.ObjectId,
        ref: 'Assignment',
        score: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  assignments: {
    _id: Types.ObjectId;
    score: number;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
// Pre middleware to always filter by { deleted: false }
const autoExcludeDeleted = function (next) {
  this.where({ deleted: false });
  next();
};

UserSchema.pre('find', autoExcludeDeleted);
UserSchema.pre('findOne', autoExcludeDeleted);
UserSchema.pre('findOneAndUpdate', autoExcludeDeleted);
UserSchema.pre('countDocuments', autoExcludeDeleted);
UserSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { deleted: false } });
  next();
});