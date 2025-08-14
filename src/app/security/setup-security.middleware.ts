import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import compression from 'compression';
import xss from 'xss';

import { Request, Response, NextFunction, Application } from 'express';
import { securityConfig } from '../config/security.config';

export function setupSecurity(app: Application): void {
  // 1. Logging
  if (securityConfig.logging.enabled) {
    app.use(morgan(securityConfig.logging.format));
  }

  // 2. HTTPS Redirect
  if (securityConfig.httpsRedirect.enabled) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (
        securityConfig.httpsRedirect.environments.includes(
          process.env.NODE_ENV || '',
        ) &&
        req.headers['x-forwarded-proto'] !== 'https'
      ) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // 3. Helmet
  if (securityConfig.helmet.enabled) {
    app.use(helmet(securityConfig.helmet.options));
  }

  // 4. CORS
  if (securityConfig.cors.enabled) {
    app.use(cors(securityConfig.cors.options));
  }

  // 5. HTTP Parameter Pollution protection
  if (securityConfig.hpp.enabled) {
    app.use(hpp(securityConfig.hpp.options));
  }

  // 6. Rate limiting
  if (securityConfig.rateLimit.enabled) {
    app.use(rateLimit(securityConfig.rateLimit.options));
  }

  // 7. Body parsers
  if (securityConfig.bodyParsers.enabled) {
    if (securityConfig.bodyParsers.json) {
      app.use(require('express').json());
    }
    if (securityConfig.bodyParsers.urlencoded.enabled) {
      app.use(
        require('express').urlencoded({
          extended: securityConfig.bodyParsers.urlencoded.extended,
        }),
      );
    }
  }

  // 8. Compression
  if (securityConfig.compression.enabled) {
    app.use(compression(securityConfig.compression.options));
  }

  // 9. XSS Sanitization
  if (securityConfig.xssSanitization.enabled) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const sanitize = (data: any): any => {
        if (typeof data === 'string') {
          return xss(data);
        } else if (Array.isArray(data)) {
          return data.map(sanitize);
        } else if (typeof data === 'object' && data !== null) {
          return Object.keys(data).reduce((acc: Record<string, any>, key) => {
            acc[key] = sanitize(data[key]);
            return acc;
          }, {});
        }
        return data;
      };

      if (req.body) {
        req.body = sanitize(req.body);
      }
      next();
    });
  }

  // 10. Debug logging
  if (securityConfig.debug.enabled && securityConfig.debug.logRequests) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      console.log('Request received:', req.body);
      next();
    });
  }
}
