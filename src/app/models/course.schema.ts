import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum CourseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true, collection: 'courses' })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor: string;

  @Prop({ required: true })
  instructorId: string;

  @Prop({ required: true })
  instructorName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category: string;

  @Prop()
  categoryId: string;

  @Prop()
  categoryName: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }])
  lessons: string[];

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Enrollment' }])
  enrollments: string[];

  @Prop({ required: true })
  coverImage: string;

  @Prop({ enum: CourseStatus, default: CourseStatus.PENDING })
  status: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop()
  publishedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserAdmin' })
  approvedBy: string;

  @Prop()
  approvedByName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserAdmin' })
  rejectedBy: string;

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
  suspendedBy: string;

  @Prop()
  suspendedByName: string;

  @Prop()
  suspensionDate: Date;

  @Prop()
  suspendReason: string;

  @Prop()
  submittedAt: Date;

  @Prop({ required: true })
  price: number;

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
