import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Lecture extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Video', required: true })
  video: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PDF' })
  notes?: Types.ObjectId;

  @Prop({ required: true })
  duration: number;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop({ default: false })
  deleted: boolean;
}

export const LectureSchema = SchemaFactory.createForClass(Lecture);

const autoExcludeDeleted = function (next) {
  this.where({ deleted: false });
  next();
};
LectureSchema.pre('find', autoExcludeDeleted);
LectureSchema.pre('findOne', autoExcludeDeleted);
LectureSchema.pre('findOneAndUpdate', autoExcludeDeleted);
LectureSchema.pre('countDocuments', autoExcludeDeleted);
LectureSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { deleted: false } });
  next();
});
