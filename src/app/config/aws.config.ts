import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import config from './config';

const appConfig = config();
const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION || '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

export const s3Client = new S3Client(s3Config);
export const S3_BUCKET = process.env.AWS_BUCKET_NAME || '';
