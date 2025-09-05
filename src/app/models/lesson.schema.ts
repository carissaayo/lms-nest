import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'lessons' })
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 1 })
  position: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Assignment' }])
  assignments: string[];

  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  noteUrl: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'LessonProgress' }])
  progress: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
