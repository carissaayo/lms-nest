import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/app/user/user.entity';

export enum WithdrawalStatus {
  PENDING = 'pending',
  FAILED = 'failed',
  SUCCESSFUL = 'successful',
}

@Schema({ timestamps: true })
export class Withdrawal extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Number, required: true, min: 0 })
  amount: number;

  @Prop({
    type: String,
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: true })
  bankId: string;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
export type WithdrawalDocument = HydratedDocument<Withdrawal>;
