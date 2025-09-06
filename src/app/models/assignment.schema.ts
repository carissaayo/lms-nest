import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Lesson } from './lesson.schema';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Assignment extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lesson', required: true })
  lesson: MongooseSchema.Types.ObjectId | Lesson;

  @Prop({ required: true })
  lessonId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor: string | User;

  @Prop({ required: true })
  instructorId: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Submission' }])
  submissions: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export type AssignmentDocument = HydratedDocument<Assignment>;

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
