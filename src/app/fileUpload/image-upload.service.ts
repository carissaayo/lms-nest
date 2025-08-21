import AWS from 'aws-sdk';
import crypto from 'crypto';
import fs from 'fs';
import { customError } from 'libs/custom-handlers';
import { imagePath } from 'src/utils/file-validation';
import config from '../config/config';

const appConfig = config();
/**
 * Saves an image to disk
 * @param image The image to save
 * @param userId The user ID
 * @returns The path where the image was saved
 */
export const saveImageToDisk = async (
  image: any,
  userId: string,
): Promise<string> => {
  try {
    const uploadPath = `./ztest/${imagePath(image, userId)}`;

    console.log('UPLOAD FILE BUFFER', image);

    fs.writeFileSync(uploadPath, image.buffer);

    console.log('BEFOR CLEARING BUFFER', image);
    image.buffer = null;
    console.log('AFTER CLEARING BUFFER', image);

    return uploadPath;
  } catch (err: any) {
    throw customError.custom('Failed to upload', 500);
  }
};

/**
 * Uploads multiple images to S3
 * @param images The images to upload
 * @param path The path prefix for the S3 key
 * @param allowDuplicate Whether to allow duplicate uploads
 * @returns An array of URLs of the uploaded images
 */
export const saveMultipleImagesS3 = async (
  images: any[],
  path: string,
  allowDuplicate?: boolean,
): Promise<string[] | null> => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const s3 = new AWS.S3();

  const promises = images.map(async (image) => {
    const inputBuffer = image.buffer;

    const hash = crypto.createHash('md5');
    const imageHash = hash.update(inputBuffer).digest('hex');

    console.log('IMAGE HASH', imageHash);

    const ext = image.mimetype.split('/')[1];
    const imageUrl = `-${imageHash}.${ext}`;

    let duplicateExist = true;

    // prevent duplicate upload
    try {
      await s3
        .headObject(
          {
            Bucket: process.env.AWS_BUCKET_NAME as string,
            Key: path + imageUrl,
          },
          (err, data) => {
            if (err) {
              if (err.code === 'NotFound') {
                console.log('Image Does Not Exist');
                duplicateExist = false;
              } else {
                duplicateExist = false;
                console.error(`Error Occured: ${err.message}`);
              }
            } else {
              console.log('DUPLICATE FOUND', data);
            }
          },
        )
        .promise();
    } catch (error: any) {
      console.error(`Image upload error occurred: ${error.message}`);
    }

    console.log('DUPLICATE', duplicateExist);

    if (!duplicateExist || allowDuplicate === true) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: path + imageUrl,
        Body: inputBuffer,
      };

      return await s3.upload(params).promise();
    }
  });

  console.log('HERE IS OUR PROMISES', promises);

  const finalResult = await Promise.all(promises)
    .then((data) => {
      console.log('DATA AFTER UPLOADING TO S3', data);
      // if file was not uploaded (in existence already)

      let res: string[] | null;

      if (!data) {
        res = null;
      } else {
        res = data
          .filter(
            (obj): obj is AWS.S3.ManagedUpload.SendData =>
              obj !== undefined && obj !== null,
          )
          .map((obj) => obj.Location);
      }

      return res;
    })
    .catch((err) => {
      console.error('Error uploading to S3:', err);
      throw customError.custom('Failed to upload image to S3', 500);
    });

  console.log('FINAL IMAGE UPLAOD LOCATION', finalResult);
  return finalResult;
};

/**
 * Uploads a single image to S3
 * @param image The image to upload
 * @param path The path prefix for the S3 key
 * @returns The URL of the uploaded image
 */
export const saveImageS3 = async (
  image: any,
  path: string,
): Promise<string> => {
  AWS.config.update({
    accessKeyId: appConfig.aws.access_key,
    secretAccessKey: appConfig.aws.secret_key,
    region: appConfig.aws.region,
  });

  const s3 = new AWS.S3();

  let inputBuffer = image.buffer;

  const hash = crypto.createHash('md5');
  const imageHash = hash.update(inputBuffer).digest('hex');

  console.log('IMAGE HASH', imageHash);

  const ext = image.mimetype.split('/')[1];
  const imageUrl = `-${imageHash}.${ext}`;

  const params = {
    Bucket: appConfig.aws.bucket_name,
    Key: path + imageUrl,
    Body: inputBuffer,
  };

  const saveToS3 = await s3
    .upload(params, (err: any, data: any) => {
      if (err) {
        console.error('Error uploading to S3:', err);
        throw customError.custom('Failed to upload image to S3', 500);
      }

      console.log('DATA AFTER UPLOADING TO S3', data);

      // Clear the buffer after uploading
      inputBuffer = null;
    })
    .promise();

  console.log('SAVETOS3 PROMISE', saveToS3);

  return saveToS3.Location;
};

export const saveFileS3 = async (file: any, path: string): Promise<string> => {
  AWS.config.update({
    accessKeyId: appConfig.aws.access_key,
    secretAccessKey: appConfig.aws.secret_key,
    region: appConfig.aws.region,
  });

  const s3 = new AWS.S3();

  let inputBuffer = file.buffer;

  const hash = crypto.createHash('md5');
  const fileHash = hash.update(inputBuffer).digest('hex');

  const ext = file.originalname.split('.').pop();
  const fileUrl = `-${fileHash}.${ext}`;

  const params = {
    Bucket: appConfig.aws.bucket_name,
    Key: path + fileUrl,
    Body: inputBuffer,
    ContentType: file.mimetype,
  };

  const uploaded = await s3
    .upload(params)
    .promise()
    .catch((err) => {
      console.error('Error uploading to S3:', err);
      throw customError.custom('Failed to upload file to S3', 500);
    });

  // Clear buffer
  inputBuffer = null;

  return uploaded.Location;
};

// Delete image from S3 using its full URL
export const deleteImageS3 = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;

  AWS.config.update({
    accessKeyId: appConfig.aws.access_key,
    secretAccessKey: appConfig.aws.secret_key,
    region: appConfig.aws.region,
  });

  const s3 = new AWS.S3();

  // Extract the Key from the imageUrl
  // Example: https://bucket-name.s3.region.amazonaws.com/images/courses-abc123.png
  const bucket = appConfig.aws.bucket_name;

  // Get the key by removing domain part
  const url = new URL(imageUrl);
  const key = url.pathname.startsWith('/')
    ? url.pathname.slice(1)
    : url.pathname;

  const params = {
    Bucket: bucket,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`🗑️ Deleted old image from S3: ${key}`);
  } catch (err) {
    console.error('❌ Failed to delete image from S3:', err);
    throw customError.custom('Failed to delete image from S3', 500);
  }
};

export const deleteFileS3 = async (fileUrl: string): Promise<void> => {
  if (!fileUrl) return;

  AWS.config.update({
    accessKeyId: appConfig.aws.access_key,
    secretAccessKey: appConfig.aws.secret_key,
    region: appConfig.aws.region,
  });

  const s3 = new AWS.S3();
  const bucket = appConfig.aws.bucket_name;

  // Extract key from URL
  const url = new URL(fileUrl);
  const key = url.pathname.startsWith('/')
    ? url.pathname.slice(1)
    : url.pathname;

  const params = { Bucket: bucket, Key: key };

  try {
    await s3.deleteObject(params).promise();
    console.log(`🗑️ Deleted file from S3: ${key}`);
  } catch (err) {
    console.error('❌ Failed to delete file from S3:', err);
    throw customError.custom('Failed to delete file from S3', 500);
  }
};
