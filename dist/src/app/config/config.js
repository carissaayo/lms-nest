"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_validation_1 = require("./config.validation");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const config = () => {
    const parsed = config_validation_1.envSchema.safeParse(process.env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.format());
        process.exit(1);
    }
    const env = parsed.data;
    return {
        port: env.PORT,
        jwtSecret: env.JWT_SECRET_KEY,
        email: {
            username: env.EMAIL_USERNAME,
            password: env.EMAIL_PASSWORD,
        },
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
exports.default = config;
//# sourceMappingURL=config.js.map