import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'submissions' })
export class Submission extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  })
  assignment: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Enrollment',
    required: true,
  })
  enrollment: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop()
  feedback: string;

  @Prop()
  grade: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}
export type SubmissionDocument = HydratedDocument<Submission>;

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
