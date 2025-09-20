import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}
@Schema({ timestamps: true, collection: 'enrollments' })
export class Enrollment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Prop({ required: true })
  paymentReference: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }])
  submissions: string[];

  @Prop()
  createdAt: Date;
}

export type EnrollmentDocument = HydratedDocument<Enrollment>;

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
