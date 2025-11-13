import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';


@Schema({ timestamps: true })
export class Bank extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  instructor: User;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true })
  bankCode: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export type BankDocument = HydratedDocument<Bank>;

export const BankSchema = SchemaFactory.createForClass(Bank);
