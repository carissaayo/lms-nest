import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export enum LessonStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true, collection: 'lesson_progress' })
export class LessonProgress extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lesson', required: true })
  lesson: string;

  @Prop({ enum: LessonStatus, default: LessonStatus.NOT_STARTED })
  status: LessonStatus;

  @Prop({ default: 0 })
  watchedDuration: number;

  @Prop({ default: false })
  completed: boolean;

  @Prop()
  startedAt: Date;

  @Prop()
  updatedAt: Date;
}

export type LessonProgressDocument = HydratedDocument<LessonProgress>;

export const LessonProgressSchema =
  SchemaFactory.createForClass(LessonProgress);
