import { envSchema } from './../config/config.validation';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Withdrawal } from './withdrawal.schema';

@Schema({ timestamps: true })
export class Otp extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Withdrawal' })
  withdrawalId: MongooseSchema.Types.ObjectId | Withdrawal;

  @Prop({ required: true })
  code: string;

  @Prop({ default: false })
  consumed: boolean;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
export type OtpDocument = HydratedDocument<Otp>;
