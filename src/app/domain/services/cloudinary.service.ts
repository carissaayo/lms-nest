import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloud_name'),
      api_key: this.configService.get<string>('cloudinary.api_key'),
      api_secret: this.configService.get<string>('cloudinary.api_secret'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: folderName },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            reject(new InternalServerErrorException('Image upload failed'));
          } else {
            resolve(result);
          }
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'videos' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) {
            reject(new InternalServerErrorException('Video upload failed'));
          } else {
            resolve(result);
          }
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFromUrl(
    url: string,
    resourceType: 'image' | 'video',
  ): Promise<UploadApiResponse> {
    try {
      const result = await cloudinary.uploader.upload(url, {
        resource_type: resourceType,
        folder: resourceType === 'video' ? 'videos' : 'images',
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException('Upload from URL failed');
    }
  }

  getPublicUrl(publicId: string, resourceType: 'image' | 'video'): string {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
    });
  }

  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video',
  ): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException('File deletion failed');
    }
  }
  deleteLocalFile(filePath: string): void {
    try {
      const resolvedPath = path.resolve(filePath);
      fs.unlinkSync(resolvedPath);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete local file');
    }
  }
}
