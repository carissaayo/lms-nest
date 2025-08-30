"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const crypto_1 = require("crypto");
const aws_config_1 = require("./aws.config");
let S3Service = class S3Service {
    async uploadImage(file, folder = 'uploads') {
        const key = `${folder}/${(0, crypto_1.randomUUID)()}-${file.originalname}`;
        await aws_config_1.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: aws_config_1.S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        return `https://${aws_config_1.S3_BUCKET}.s3.amazonaws.com/${key}`;
    }
    async deleteImage(key) {
        await aws_config_1.s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: aws_config_1.S3_BUCKET,
            Key: key,
        }));
        return { deleted: true };
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)()
], S3Service);
//# sourceMappingURL=aws.service.js.map