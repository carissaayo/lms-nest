import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User', required: true }] })
  studentsEnrolled: Types.ObjectId[];

  @Prop({ required: true })
  category: string;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy: Types.ObjectId;

  @Prop()
  approvalDate: Date;

  @Prop({ default: false })
  isSubmitted: boolean;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: {
      url: { type: String },
      imageName: { type: String, unique: true },
      caption: { type: String },
    },
    _id: false,
  })
  image: {
    url: string;
    imageName: string;
    caption?: string;
  };

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lecture' }] })
  lectures: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Quizz' })
  quizz: Types.ObjectId;

  @Prop({ default: false })
  deleted: boolean;
}

export type CourseDocument = Course & Document;
export const CourseSchema = SchemaFactory.createForClass(Course);
// Pre middleware to always filter by { deleted: false }
const autoExcludeDeleted = function (next) {
  this.where({ deleted: false });
  next();
};
CourseSchema.pre('find', autoExcludeDeleted);
CourseSchema.pre('findOne', autoExcludeDeleted);
CourseSchema.pre('findOneAndUpdate', autoExcludeDeleted);
CourseSchema.pre('countDocuments', autoExcludeDeleted);
CourseSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { deleted: false } });
  next();
});
