import { config as loadEnv } from 'dotenv';
import { envSchema, EnvVars } from './config.validation';
import path from 'path';
loadEnv();

const envMap: Record<string, string> = {
  development: '.env.dev',
  production: '.env',
};

// Default to dev if NODE_ENV is missing or invalid
const envFile = envMap[process.env.NODE_ENV || 'development'] || '.env.dev';

loadEnv({ path: path.resolve(process.cwd(), envFile) });

const config = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1); // Stop the app if validation fails
  }

  const env: EnvVars = parsed.data;

  return {
    port: env.PORT,
    environment: env.NODE_ENV,
    jwtSecret: env.JWT_SECRET_KEY,
    mongoUri: env.MONGO_URI,
    helmet: env.HELMET,
    logging: env.LOGGING,
    cors: {
      origin: env.CORS_ORIGIN,
    },
    rate_limit: {
      window: env.RATE_LIMIT_WINDOW,
      max: env.RATE_LIMIT_MAX,
    },
    https: {
      redirect: env.HTTPS_REDIRECT,
      environment: env.HTTPS_ENVIRONMENTS,
    },
    email: {
      username: env.EMAIL_USERNAME,
      password: env.EMAIL_PASSWORD,
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
    },
    salt_rounds: env.SALTROUNDS,
    jwt: {
      access_token_secret: env.JWT_ACCESS_TOKEN_SECRET,
      refresh_token_secret: env.JWT_REFRESH_TOKEN_SECRET,
      duration30d: env.JWT_EXPIRES_30_DAYS,
      duration90d: env.JWT_EXPIRES_90_DAYS,
      duration10m: env.JWT_EXPIRES_TEN_MINS,
      duration1Yr: env.JWT_EXPIRES_ONE_YEAR,
      duration1d: env.JWT_EXPIRES_ONE_DAY,
    },
    aws: {
      access_key: env.AWS_ACCESS_KEY_ID,
      secret_key: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket_name: env.AWS_BUCKET_NAME,
    },
    max_failed_attempts: env.MAX_FAILED_ATTEMPTS,
    lock_time: env.LOCK_TIME,
    // prembly: {
    //   api_key: env.PREMBLY_API_KEY,
    //   base_url: env.PREMBLY_BASE_URL,
    // },
    // qoreid: {
    //   secret_key: env.QOREID_SECRET,
    //   client_id: env.QOREID_CLIENTID,
    //   base_url: env.QOREID_BASE_URL,
    // },
    // flw: {
    //   credlock_pulic_key: env.FLW_PUBLIC_KEY_CREDLOCK,
    //   credlock_secret_key: env.FLW_SECRET_KEY_CREDLOCK,
    //   credlock_encrption_key: env.FLW_ENCRYPTION_KEY_CREDLOCK,
    //   partner_efinance: env.PARTNER_EFINANCE,
    //   efinance_public_key: env.FLW_PUBLIC_KEY_EFINANCE,
    //   efinance_secret_key: env.FLW_SECRET_KEY_EFINANCE,
    //   partner_credlock: env.PARTNER_CREDLOCK,
    //   secret_key: env.FLW_SECRET_KEY,
    //   public_key: env.FLW_PUBLIC_KEY,
    //   base_url: env.FLW_BASE_URL,
    //   secret_hash: env.FLW_SECRET_HASH,
    //   flw_autodebit_secret_salt: env.FLW_AUTODEBIT_SECRET_SALT,
    // },
    // monnify: {
    //   api_key: env.MONNIFY_API_KEY,
    //   secret_key: env.MONNIFY_SECRET_KEY,
    //   base_url: env.MONNIFY_BASE_URL,
    //   source_account_number: env.MONNIFY_SOURCE_ACCOUNT,
    // },
    // base: {
    //   logo: env.CREDLOCK_LOGO,
    //   flw_redirect_url: env.FLW_FRONTEND_REDIRECT_URL,
    //   base_url:env.BASE_URL
    // },
  };
};

export default config;
