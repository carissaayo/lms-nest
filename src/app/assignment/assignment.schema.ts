import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Assignment extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Lecture', required: true })
  lecture: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  instructor: Types.ObjectId;

  @Prop({ required: true })
  dueDate: number;

  @Prop({ type: Types.ObjectId, ref: 'PDF', required: true })
  file: Types.ObjectId;

  @Prop({
    type: [
      {
        studentId: { type: Types.ObjectId, ref: 'User', required: true },
        submittedFileId: { type: Types.ObjectId, ref: 'PDF', required: true },
        fileFolder: { type: String, required: true },
      },
    ],
    default: [],
  })
  interestedStudents: {
    studentId: Types.ObjectId;
    submittedFileId: Types.ObjectId;
    fileFolder: string;
  }[];

  @Prop({ default: false })
  deleted: boolean;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);

const autoExcludeDeleted = function (next) {
  this.where({ deleted: false });
  next();
};

AssignmentSchema.pre('find', autoExcludeDeleted);
AssignmentSchema.pre('findOne', autoExcludeDeleted);
AssignmentSchema.pre('findOneAndUpdate', autoExcludeDeleted);
AssignmentSchema.pre('countDocuments', autoExcludeDeleted);
AssignmentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { deleted: false } });
  next();
});
