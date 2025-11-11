import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type SecurityLogDocument = HydratedDocument<SecurityLog>;

@Schema({ timestamps: true })
export class SecurityLog {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  method: string;

  @Prop({ type: String, required: false })
  userId?: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop({ required: true, min: 0, max: 100 })
  riskScore: number;

  @Prop({ required: true, default: false })
  blocked: boolean;

  @Prop()
  reason?: string;
}

export const SecurityLogSchema = SchemaFactory.createForClass(SecurityLog);
