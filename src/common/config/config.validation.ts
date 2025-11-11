import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number),
  JWT_SECRET_KEY: z
    .string()
    .min(
      1,
      'JWT_SECRET_KEY is required and must be at least 10 characters long',
    ),
  MONGO_URI: z.string().url('Invalid MongoDB connection URL'),
  EMAIL_USERNAME: z
    .string()
    .min(1, 'EMAIL_USERNAME is required for sending mails'),
  EMAIL_PASSWORD: z
    .string()
    .min(1, 'EMAIL_PASSWORD is also required for sending mails'),
  EMAIL_HOST: z
    .string()
    .min(1, 'EMAIL_HOST is also required for sending mails'),
  EMAIL_PORT: z
    .string()
    .min(1, 'EMAIL_PORT is also required for sending mails'),

  SALTROUNDS: z.string().default('10'),
  JWT_ACCESS_TOKEN_SECRET: z
    .string()
    .min(1, 'JWT_ACCESS_TOKEN_SECRET is required'),
  JWT_REFRESH_TOKEN_SECRET: z
    .string()
    .min(1, 'JWT_REFRESH_TOKEN_SECRET is required'),
  JWT_EXPIRES_30_DAYS: z.string().min(1, 'JWT_EXPIRES_30_DAYS is required'),
  JWT_EXPIRES_90_DAYS: z.string().min(1, 'JWT_EXPIRES_90_DAYS is required'),
  JWT_EXPIRES_TEN_MINS: z.string().min(1, 'JWT_EXPIRES_TEN_MINS is required'),
  JWT_EXPIRES_ONE_YEAR: z.string().min(1, 'JWT_EXPIRES_ONE_YEAR is required'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_REGION: z.string().min(1, 'AWS_REGION is required'),
  AWS_BUCKET_NAME: z.string().min(1, 'AWS_BUCKET_NAME is required'),
  HTTPS_ENVIRONMENTS: z.string().min(1, 'AWS_BUCKET_NAME is required'),
  HTTPS_REDIRECT: z.string().min(1, 'HTTPS_REDIRECT is required'),
  RATE_LIMIT_MAX: z.string().min(1, 'RATE_LIMIT_MAX is required'),
  RATE_LIMIT_WINDOW: z.string().min(1, 'AWS_BUCKET_NAME is required'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  LOGGING: z.string().min(1, 'LOGGING is required'),
  HELMET: z.string().min(1, 'LOGGING is required'),
  MAX_FAILED_ATTEMPTS: z.string().min(1, 'MAX_FAILED_ATTEMPTS is required'),
  LOCK_TIME: z.string().min(1, 'LOCK_TIME is required'),
  PREMBLY_API_KEY: z.string().min(1, 'PREMBLY_API_KEY is required'),
  PREMBLY_BASE_URL: z.string().min(1, 'PREMBLY_BASE_URL is required'),
  QOREID_SECRET: z.string().min(1, 'QOREID_SECRET is required'),
  QOREID_CLIENTID: z.string().min(1, 'QOREID_CLIENTID is required'),
  QOREID_BASE_URL: z.string().min(1, 'QOREID_BASE_URL is required'),
  FLW_PUBLIC_KEY_CREDLOCK: z
    .string()
    .min(1, 'FLW_PUBLIC_KEY_CREDLOCK is required'),
  FLW_SECRET_KEY_CREDLOCK: z
    .string()
    .min(1, 'FLW_SECRET_KEY_CREDLOCK is required'),
  FLW_ENCRYPTION_KEY_CREDLOCK: z
    .string()
    .min(1, 'FLW_ENCRYPTION_KEY_CREDLOCK is required'),
  PARTNER_EFINANCE: z.string().min(1, 'PARTNER_EFINANCE is required'),
  FLW_PUBLIC_KEY_EFINANCE: z
    .string()
    .min(1, 'FLW_PUBLIC_KEY_EFINANCE is required'),
  FLW_SECRET_KEY_EFINANCE: z
    .string()
    .min(1, 'FLW_SECRET_KEY_EFINANCE is required'),
  PARTNER_CREDLOCK: z.string().min(1, 'PARTNER_CREDLOCK is required'),

  MONNIFY_API_KEY: z.string().min(1, 'MONNIFY_API_KEY is required'),

  MONNIFY_SECRET_KEY: z.string().min(1, 'MONNIFY_SECRET_KEY is required'),

  MONNIFY_BASE_URL: z.string().min(1, 'MONNIFY_BASE_URL is required'),

  MONNIFY_SOURCE_ACCOUNT: z
    .string()
    .min(1, 'MONNIFY_SOURCE_ACCOUNT is required'),
  FLW_SECRET_KEY: z.string().min(1, 'FLW_SECRET_KEY is required'),
  FLW_PUBLIC_KEY: z.string().min(1, 'FLW_PUBLIC_KEY is required'),
  FLW_BASE_URL: z.string().min(1, 'FLW_BASE_URL is required'),
  FLW_SECRET_HASH: z.string().min(1, 'FLW_SECRET_HASH is required'),
  BASE_URL: z.string().min(1, 'BASE_URL is required'),
  CREDLOCK_LOGO: z.string().min(1, 'CREDLOCK_LOGO is required'),
  FLW_FRONTEND_REDIRECT_URL: z
    .string()
    .min(1, 'FLW_FRONTEND_REDIRECT_URL is required'),
  FLW_AUTODEBIT_SECRET_SALT: z
    .string()
    .min(1, 'FLW_AUTODEBIT_SECRET_SALT is required'),
});

export type EnvVars = z.infer<typeof envSchema>;
