import { registerAs } from '@nestjs/config';
import config from './config';

const appConfig = config();
export default registerAs('security', () => ({
  logging: process.env.LOGGING === 'true',
  helmet: { enabled: appConfig.helmet !== 'false' },
  cors: {
    enabled: true,
    origin: appConfig.cors.origin || '*',
  },
  hpp: { enabled: true },
  rateLimit: {
    enabled: true,
    windowMs: parseInt(appConfig.rate_limit.window, 10),
    max: parseInt(appConfig.rate_limit.window || '50', 10), // 50 requests
  },
  compression: { enabled: true },
  mongoSanitize: { enabled: true },
  xss: { enabled: true },
  validation: { whitelist: true, transform: true, forbidNonWhitelisted: true },
  httpsRedirect: {
    enabled: appConfig.https.redirect === 'true',
    environments: (appConfig.https.environment || 'production').split(','),
  },
}));
