import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import { AllExceptionsFilter } from './libs/all-exception.filter';
import { HttpsRedirectMiddleware } from './security/middlewares/https-redirect.middleware';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());
  // 🔥 FIX: Enable trust proxy for Render
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpsMiddleware = new HttpsRedirectMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) =>
    httpsMiddleware.use(req, res, next),
  );


  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  


  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://lms-frontend-rsbi.vercel.app',
      'https://lms-frontend-seven-gold.vercel.app',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: '*',
  });

  
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  const serverUrl =
  process.env.NODE_ENV === 'production'
  ? process.env.BASE_URL
  : `http://localhost:${port}`;
  
    console.log(`Server running on ${serverUrl}`);
}

bootstrap();
