"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileS3 = exports.deleteImageS3 = exports.saveFileS3 = exports.saveImageS3 = exports.saveMultipleImagesS3 = exports.saveImageToDisk = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const custom_handlers_1 = require("../../../libs/custom-handlers");
const file_validation_1 = require("../../utils/file-validation");
const config_1 = __importDefault(require("../config/config"));
const appConfig = (0, config_1.default)();
const saveImageToDisk = async (image, userId) => {
    try {
        const uploadPath = `./ztest/${(0, file_validation_1.imagePath)(image, userId)}`;
        console.log('UPLOAD FILE BUFFER', image);
        fs_1.default.writeFileSync(uploadPath, image.buffer);
        console.log('BEFOR CLEARING BUFFER', image);
        image.buffer = null;
        console.log('AFTER CLEARING BUFFER', image);
        return uploadPath;
    }
    catch (err) {
        throw custom_handlers_1.customError.custom('Failed to upload', 500);
    }
};
exports.saveImageToDisk = saveImageToDisk;
const saveMultipleImagesS3 = async (images, path, allowDuplicate) => {
    aws_sdk_1.default.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
    });
    const s3 = new aws_sdk_1.default.S3();
    const promises = images.map(async (image) => {
        const inputBuffer = image.buffer;
        const hash = crypto_1.default.createHash('md5');
        const imageHash = hash.update(inputBuffer).digest('hex');
        console.log('IMAGE HASH', imageHash);
        const ext = image.mimetype.split('/')[1];
        const imageUrl = `-${imageHash}.${ext}`;
        let duplicateExist = true;
        try {
            await s3
                .headObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: path + imageUrl,
            }, (err, data) => {
                if (err) {
                    if (err.code === 'NotFound') {
                        console.log('Image Does Not Exist');
                        duplicateExist = false;
                    }
                    else {
                        duplicateExist = false;
                        console.error(`Error Occured: ${err.message}`);
                    }
                }
                else {
                    console.log('DUPLICATE FOUND', data);
                }
            })
                .promise();
        }
        catch (error) {
            console.error(`Image upload error occurred: ${error.message}`);
        }
        console.log('DUPLICATE', duplicateExist);
        if (!duplicateExist || allowDuplicate === true) {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
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
        let res;
        if (!data) {
            res = null;
        }
        else {
            res = data
                .filter((obj) => obj !== undefined && obj !== null)
                .map((obj) => obj.Location);
        }
        return res;
    })
        .catch((err) => {
        console.error('Error uploading to S3:', err);
        throw custom_handlers_1.customError.custom('Failed to upload image to S3', 500);
    });
    console.log('FINAL IMAGE UPLAOD LOCATION', finalResult);
    return finalResult;
};
exports.saveMultipleImagesS3 = saveMultipleImagesS3;
const saveImageS3 = async (image, path) => {
    aws_sdk_1.default.config.update({
        accessKeyId: appConfig.aws.access_key,
        secretAccessKey: appConfig.aws.secret_key,
        region: appConfig.aws.region,
    });
    const s3 = new aws_sdk_1.default.S3();
    let inputBuffer = image.buffer;
    const hash = crypto_1.default.createHash('md5');
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
        .upload(params, (err, data) => {
        if (err) {
            console.error('Error uploading to S3:', err);
            throw custom_handlers_1.customError.custom('Failed to upload image to S3', 500);
        }
        console.log('DATA AFTER UPLOADING TO S3', data);
        inputBuffer = null;
    })
        .promise();
    console.log('SAVETOS3 PROMISE', saveToS3);
    return saveToS3.Location;
};
exports.saveImageS3 = saveImageS3;
const saveFileS3 = async (file, path) => {
    aws_sdk_1.default.config.update({
        accessKeyId: appConfig.aws.access_key,
        secretAccessKey: appConfig.aws.secret_key,
        region: appConfig.aws.region,
    });
    const s3 = new aws_sdk_1.default.S3();
    let inputBuffer = file.buffer;
    const hash = crypto_1.default.createHash('md5');
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
        throw custom_handlers_1.customError.custom('Failed to upload file to S3', 500);
    });
    inputBuffer = null;
    return uploaded.Location;
};
exports.saveFileS3 = saveFileS3;
const deleteImageS3 = async (imageUrl) => {
    if (!imageUrl)
        return;
    aws_sdk_1.default.config.update({
        accessKeyId: appConfig.aws.access_key,
        secretAccessKey: appConfig.aws.secret_key,
        region: appConfig.aws.region,
    });
    const s3 = new aws_sdk_1.default.S3();
    const bucket = appConfig.aws.bucket_name;
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
    }
    catch (err) {
        console.error('❌ Failed to delete image from S3:', err);
        throw custom_handlers_1.customError.custom('Failed to delete image from S3', 500);
    }
};
exports.deleteImageS3 = deleteImageS3;
const deleteFileS3 = async (fileUrl) => {
    if (!fileUrl)
        return;
    aws_sdk_1.default.config.update({
        accessKeyId: appConfig.aws.access_key,
        secretAccessKey: appConfig.aws.secret_key,
        region: appConfig.aws.region,
    });
    const s3 = new aws_sdk_1.default.S3();
    const bucket = appConfig.aws.bucket_name;
    const url = new URL(fileUrl);
    const key = url.pathname.startsWith('/')
        ? url.pathname.slice(1)
        : url.pathname;
    const params = { Bucket: bucket, Key: key };
    try {
        await s3.deleteObject(params).promise();
        console.log(`🗑️ Deleted file from S3: ${key}`);
    }
    catch (err) {
        console.error('❌ Failed to delete file from S3:', err);
        throw custom_handlers_1.customError.custom('Failed to delete file from S3', 500);
    }
};
exports.deleteFileS3 = deleteFileS3;
//# sourceMappingURL=image-upload.service.js.map