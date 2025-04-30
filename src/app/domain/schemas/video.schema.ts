import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Video extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  sizeInKB: string;

  @Prop({ required: true })
  sizeInMB: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  uploader: User | MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  role: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
