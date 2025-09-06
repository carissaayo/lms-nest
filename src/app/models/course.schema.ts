import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { UserAdmin } from './admin.schema';

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

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor: MongooseSchema.Types.ObjectId | UserAdmin;

  @Prop({ required: true })
  instructorName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: string;

  @Prop()
  categoryName: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }])
  lessons: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Enrollment' }])
  enrollments: string[];

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

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type CourseDocument = HydratedDocument<Course>;

export const CourseSchema = SchemaFactory.createForClass(Course);
