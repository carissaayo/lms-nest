import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserAdmin } from './admin.schema';
import { User } from './user.schema';
import { CourseCategory } from 'src/app/course/course.interface';

export enum CourseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructorId: MongooseSchema.Types.ObjectId | User;

  @Prop({ required: true })
  instructorName: string;

  @Prop({ enum:CourseCategory, type:String,required: true })
  category: CourseCategory;

 

  @Prop({ type: Number, default: 0 })
  lessons: number;

  @Prop({ type: Number, default: 0 })
  enrollments: number;

  @Prop({ required: true })
  coverImage: string;

  @Prop({ enum: CourseStatus, default: CourseStatus.PENDING })
  status: CourseStatus;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserAdmin' })
  approvedBy: MongooseSchema.Types.ObjectId | UserAdmin;

  @Prop()
  approvedByName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserAdmin' })
  rejectedBy: MongooseSchema.Types.ObjectId | UserAdmin;

  @Prop()
  rejectedByName: string;

  @Prop()
  rejectReason: string;

  @Prop()
  approvalDate: Date;

  @Prop()
  rejectionDate: Date;

  @Prop({ default: false })
  isSubmitted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserAdmin' })
  suspendedBy: MongooseSchema.Types.ObjectId | UserAdmin;

  @Prop()
  suspendedByName: string;

  @Prop()
  suspensionDate: Date;

  @Prop({ type: String, default: undefined })
  suspendReason: string;

  @Prop({ type: Date })
  submittedAt: Date | undefined;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  duration: number;

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type CourseDocument = HydratedDocument<Course>;

export const CourseSchema = SchemaFactory.createForClass(Course);
