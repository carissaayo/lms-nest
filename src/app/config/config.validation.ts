import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  JWT_SECRET_KEY: z.string().min(5, 'JWT_SECRET_KEY is required'),
  MONGO_URI: z.string().url('Invalid MongoDB connection URL'),
  ADMIN_EMAIL: z.string().min(5, 'ADMIN_EMAIL is required for sending mails'),
  APP_NAME: z.string().min(1, 'APP_NAME is required for sending mails'),
  EMAIL_USERNAME: z
    .string()
    .min(5, 'EMAIL_USERNAME is required for sending mails'),
  EMAIL_PASSWORD: z
    .string()
    .min(5, 'EMAIL_PASSWORD is also required for sending mails'),
  APP_URL: z.string().min(5, 'APP_URL is  required '),
  FRONTEND_URL: z.string().min(5, 'FRONTEND_URL is  required '),
  SALTROUNDS: z.string().default('10'),
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.string().min(1, 'DB_PORT is required'),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASS: z.string().min(1, 'DB_PASS is required'),
  JWT_ACCESS_TOKEN_SECRET: z
    .string()
    .min(10, 'JWT_ACCESS_TOKEN_SECRET is required'),
  JWT_REFRESH_TOKEN_SECRET: z
    .string()
    .min(10, 'JWT_REFRESH_TOKEN_SECRET is required'),
  JWT_EXPIRES_30_DAYS: z.string().min(1, 'JWT_EXPIRES_30_DAYS is required'),
  JWT_EXPIRES_90_DAYS: z.string().min(1, 'JWT_EXPIRES_90_DAYS is required'),
  JWT_EXPIRES_TEN_MINS: z.string().min(1, 'JWT_EXPIRES_TEN_MINS is required'),
  JWT_ACCESS_TOKEN_SECRET_USER: z
    .string()
    .min(1, 'JWT_EXPIRES_TEN_MINS is required'),
  JWT_EXPIRES_ONE_DAY: z.string().min(1, 'JWT_EXPIRES_ONE_DAY is required'),

  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_BUCKET_NAME: z.string().min(1, 'AWS_BUCKET_NAME is required'),
  PAYSTACK_SECRET_KEY: z.string().min(1, 'PAYSTACK_SECRET_KEY is required'),
  PAYSTACK_BASE_URL: z.string().min(1, 'PAYSTACK_BASE_URL is required'),
  MONNIFY_ENV: z.string().min(1, 'MONNIFY_ENV is required'),
  MONNIFY_APIKEY: z.string().min(1, 'MONNIFY_APIKEY is required'),
  MONNIFY_SECRET: z.string().min(1, 'MONNIFY_SECRET is required'),
  MAX_FAILED_ATTEMPTS: z.string().min(1, 'MAX_FAILED_ATTEMPTS is required'),
  LOCK_TIME: z.string().min(1, 'LOCK_TIME is required'),
});

export type EnvVars = z.infer<typeof envSchema>;
