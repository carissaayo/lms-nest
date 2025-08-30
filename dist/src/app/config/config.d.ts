declare const config: () => {
    port: number;
    jwtSecret: string;
    email: {
        username: string;
        password: string;
    };
    salt_rounds: string;
    admin: {
        email: string;
    };
    database: {
        host: string;
        port: string;
        password: string;
        name: string;
        user: string;
    };
    app: {
        name: string;
    };
    jwt: {
        access_token: string;
        refresh_token: string;
        duration30d: string;
        duration90d: string;
        duration10m: string;
        secret_user: string;
    };
    aws: {
        access_key: string;
        secret_key: string;
        region: string;
        bucket_name: string;
    };
    paystack: {
        secret_key: string;
        url: string;
    };
    monnify: {
        env: string;
        api_key: string;
        secret_key: string;
        access_token: string;
    };
};
export default config;
