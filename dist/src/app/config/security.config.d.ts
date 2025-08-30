export declare const securityConfig: {
    httpsRedirect: {
        enabled: boolean;
        environments: string[];
    };
    helmet: {
        enabled: boolean;
        options: {};
    };
    cors: {
        enabled: boolean;
        options: {
            origin: string;
            methods: string;
        };
    };
    hpp: {
        enabled: boolean;
        options: {};
    };
    rateLimit: {
        enabled: boolean;
        options: {
            windowMs: number;
            max: number;
        };
    };
    bodyParsers: {
        enabled: boolean;
        json: boolean;
        urlencoded: {
            enabled: boolean;
            extended: boolean;
        };
    };
    compression: {
        enabled: boolean;
        options: {};
    };
    xssSanitization: {
        enabled: boolean;
    };
    logging: {
        enabled: boolean;
        format: string;
    };
    debug: {
        enabled: boolean;
        logRequests: boolean;
    };
};
