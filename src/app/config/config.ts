import { envSchema, EnvVars } from './config.validation';
import { config as loadEnv } from 'dotenv';
loadEnv();
const config = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1); // Stop the app if validation fails
  }

  const env: EnvVars = parsed.data;

  return {
    port: env.PORT,
    jwtSecret: env.JWT_SECRET_KEY,
    // mongoUri: env.MONGO_URI,
    // redis: {
    //   host: env.REDIS_HOST,
    //   port: env.REDIS_PORT,
    // },
    // paystack: {
    //   baseUrl: env.PAYSTACK_BASE_URL,
    //   secret: env.PAYSTACK_SECRET,
    // },
    email: {
      username: env.EMAIL_USERNAME,
      password: env.EMAIL_PASSWORD,
    },
    // app_url: env.APP_URL,
    salt_rounds: env.SALTROUNDS,
    admin: {
      email: env.ADMIN_EMAIL,
    },
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      password: env.DB_PASS,
      name: env.DB_NAME,
      user: env.DB_USER,
    },
    app: {
      name: env.APP_NAME,
    },
    jwt: {
      access_token: env.JWT_ACCESS_TOKEN_SECRET,
      refresh_token: env.JWT_REFRESH_TOKEN_SECRET,
      duration30d: env.JWT_EXPIRES_30_DAYS,
      duration90d: env.JWT_EXPIRES_90_DAYS,
      duration10m: env.JWT_EXPIRES_TEN_MINS,
      secret_user: env.JWT_ACCESS_TOKEN_SECRET_USER,
    },
    aws: {
      access_key: env.AWS_ACCESS_KEY_ID,
      secret_key: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket_name: env.AWS_BUCKET_NAME,
    },
    paystack: {
      secret_key: env.PAYSTACK_SECRET_KEY,
      url: env.PAYSTACK_BASE_URL,
    },
    monnify: {
      env: env.MONNIFY_ENV,
      api_key: env.MONNIFY_APIKEY,
      secret_key: env.MONNIFY_SECRET,
      access_token: env.MONNIFY_ACCESSTOKEN,
    },
  };
};

export default config;
