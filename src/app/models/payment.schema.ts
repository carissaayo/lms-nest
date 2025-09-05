import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'payments' })
export class Payment extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  student: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course', required: true })
  course: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'paystack' })
  provider: string;

  @Prop({ required: true })
  reference: string;

  @Prop({ default: 'success' })
  status: string;

  @Prop()
  createdAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
