import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';
import { Payment } from './payment.schema';


@Schema({ timestamps: true })
export class Earning extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId | Course;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Payment', required: true })
  payment: MongooseSchema.Types.ObjectId | Payment;

  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({ type: Number, required: true, min: 0 })
  platformShare: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const EarningSchema = SchemaFactory.createForClass(Earning);
export type EarningDocument = HydratedDocument<Earning>;
