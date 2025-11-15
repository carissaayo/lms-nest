import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';


export enum PaymentStatus{
  SUCCESS="success",
  FAILED="failed"
}
@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'paystack' })
  provider: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ enum: PaymentStatus, type: String, default: PaymentStatus.SUCCESS })
  status: PaymentStatus;

  @Prop()
  createdAt: Date;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
