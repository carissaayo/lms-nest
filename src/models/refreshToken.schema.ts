import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';



@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, index: true })
  tokenHash: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'UserAdmin', index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ default: null })
  lastUsedAt: Date;

  @Prop({ default: false, index: true })
  isRevoked: boolean;

  @Prop({ default: null })
  revokedAt: Date;

  @Prop({ default: null })
  revokedReason: string;

  @Prop({ default: '' })
  userAgent: string;

  @Prop({ default: '' })
  ipAddress: string;

  @Prop({ default: 0 })
  version: number;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
export type RefreshTokenDocument = RefreshToken & Document;
// TTL index to automatically delete expired documents
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
