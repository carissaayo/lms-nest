import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Course } from './course.schema';
import { Assignment } from './assignment.schema';

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 1 })
  position: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId | Course;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Assignment' }])
  assignments: MongooseSchema.Types.ObjectId[] | Assignment[];

  @Prop({ required: true })
  courseId: string;

  @Prop({ type: Number,required:true })
  duration: number;

  @Prop({ required: true })
  videoUrl: string;

  @Prop()
  noteUrl: string;


  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  instructor: MongooseSchema.Types.ObjectId;
}

export type LessonDocument = HydratedDocument<Lesson>;
export const LessonSchema = SchemaFactory.createForClass(Lesson);
