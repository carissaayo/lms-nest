"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: zod_1.z.string().regex(/^\d+$/).transform(Number),
    JWT_SECRET_KEY: zod_1.z
        .string()
        .min(10, 'JWT_SECRET_KEY is required and must be at least 10 characters long'),
    ADMIN_EMAIL: zod_1.z.string().min(10, 'ADMIN_EMAIL is required for sending mails'),
    APP_NAME: zod_1.z.string().min(1, 'APP_NAME is required for sending mails'),
    EMAIL_USERNAME: zod_1.z
        .string()
        .min(10, 'EMAIL_USERNAME is required for sending mails'),
    EMAIL_PASSWORD: zod_1.z
        .string()
        .min(10, 'EMAIL_PASSWORD is also required for sending mails'),
    SALTROUNDS: zod_1.z.string().default('10'),
    DB_HOST: zod_1.z.string().min(1, 'DB_HOST is required'),
    DB_PORT: zod_1.z.string().min(1, 'DB_PORT is required'),
    DB_NAME: zod_1.z.string().min(1, 'DB_NAME is required'),
    DB_USER: zod_1.z.string().min(1, 'DB_USER is required'),
    DB_PASS: zod_1.z.string().min(1, 'DB_PASS is required'),
    JWT_ACCESS_TOKEN_SECRET: zod_1.z
        .string()
        .min(10, 'JWT_ACCESS_TOKEN_SECRET is required'),
    JWT_REFRESH_TOKEN_SECRET: zod_1.z
        .string()
        .min(10, 'JWT_REFRESH_TOKEN_SECRET is required'),
    JWT_EXPIRES_30_DAYS: zod_1.z.string().min(1, 'JWT_EXPIRES_30_DAYS is required'),
    JWT_EXPIRES_90_DAYS: zod_1.z.string().min(1, 'JWT_EXPIRES_90_DAYS is required'),
    JWT_EXPIRES_TEN_MINS: zod_1.z.string().min(1, 'JWT_EXPIRES_TEN_MINS is required'),
    JWT_ACCESS_TOKEN_SECRET_USER: zod_1.z
        .string()
        .min(1, 'JWT_EXPIRES_TEN_MINS is required'),
    AWS_ACCESS_KEY_ID: zod_1.z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
    AWS_REGION: zod_1.z.string().min(1, 'AWS_REGION is required'),
    AWS_BUCKET_NAME: zod_1.z.string().min(1, 'AWS_BUCKET_NAME is required'),
    PAYSTACK_SECRET_KEY: zod_1.z.string().min(1, 'PAYSTACK_SECRET_KEY is required'),
    PAYSTACK_BASE_URL: zod_1.z.string().min(1, 'PAYSTACK_BASE_URL is required'),
    MONNIFY_ENV: zod_1.z.string().min(1, 'MONNIFY_ENV is required'),
    MONNIFY_APIKEY: zod_1.z.string().min(1, 'MONNIFY_APIKEY is required'),
    MONNIFY_SECRET: zod_1.z.string().min(1, 'MONNIFY_SECRET is required'),
    MONNIFY_ACCESSTOKEN: zod_1.z.string().min(1, 'MONNIFY_SECRET is required'),
});
//# sourceMappingURL=config.validation.js.map