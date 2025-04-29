import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class PDF extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  sizeInKB: string;

  @Prop({ required: true })
  sizeInMB: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  uploader: User | MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['instructor', 'student'] })
  role: 'instructor' | 'student';

  @Prop({ required: true })
  fileFolder: string;
}

export const PDFSchema = SchemaFactory.createForClass(PDF);
