// src/common/services/s3.service.ts
import { Injectable } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { randomUUID } from 'crypto';
import { S3_BUCKET, s3Client } from './aws.config';

@Injectable()
export class S3Service {
  async uploadImage(file: Express.Multer.File, folder = 'uploads') {
    const key = `${folder}/${randomUUID()}-${file.originalname}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
  }

  async deleteImage(key: string) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      }),
    );
    return { deleted: true };
  }
}
