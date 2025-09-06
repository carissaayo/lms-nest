import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  createdAt: Date;
}
export type TransactionDocument = HydratedDocument<Transaction>;

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
