import { envSchema, EnvVars } from './config.validation';
import { config as loadEnv } from 'dotenv';
loadEnv();
export default () => {
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
    // email: {
    //   username: env.EMAIL_USERNAME,
    //   password: env.EMAIL_PASSWORD,
    // },
    // app_url: env.APP_URL,
    salt_rounds: env.SALTROUNDS,
    // cloudinary: {
    //   cloud_name: env.CLOUDINARY_CLOUD_NAME,
    //   api_key: env.CLOUDINARY_API_KEY,
    //   api_secret: env.CLOUDINARY_API_SECRET,
    // },
    // client_url: env.CLIENT_URL,
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
  };
};
