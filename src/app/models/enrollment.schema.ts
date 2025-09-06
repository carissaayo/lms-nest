import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'enrollments' })
export class Enrollment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: string;

  @Prop({ default: 'active' })
  status: string;

  @Prop({ required: true })
  paymentReference: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }])
  submissions: string[];

  @Prop()
  createdAt: Date;
}

export type EnrollmentDocument = HydratedDocument<Enrollment>;

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
