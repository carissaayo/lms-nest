"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3_BUCKET = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = __importDefault(require("./config"));
const appConfig = (0, config_1.default)();
const s3Config = {
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
};
exports.s3Client = new client_s3_1.S3Client(s3Config);
exports.S3_BUCKET = process.env.AWS_BUCKET_NAME || '';
//# sourceMappingURL=aws.config.js.map