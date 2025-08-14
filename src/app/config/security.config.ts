// src/config/security.config.ts
export const securityConfig = {
  httpsRedirect: {
    enabled: true,
    environments: ['production'],
  },
  helmet: {
    enabled: true,
    options: {},
  },
  cors: {
    enabled: true,
    options: { origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' },
  },
  hpp: {
    enabled: true,
    options: {},
  },
  rateLimit: {
    enabled: true,
    options: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
  bodyParsers: {
    enabled: true,
    json: true,
    urlencoded: {
      enabled: true,
      extended: true,
    },
  },
  compression: {
    enabled: true,
    options: {},
  },
  xssSanitization: {
    enabled: true,
  },
  logging: {
    enabled: true,
    format: 'dev',
  },
  debug: {
    enabled: false,
    logRequests: false,
  },
};
