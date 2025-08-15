import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import * as path from 'path';
import { S3_BUCKET, s3Client } from 'src/app/config/aws.config';

export async function uploadToS3(file: Express.Multer.File): Promise<string> {
  const fileExt = path.extname(file.originalname);
  const fileKey = `course-cover/${uuid()}${fileExt}`;

  const uploadParams = {
    Bucket: S3_BUCKET,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
}
