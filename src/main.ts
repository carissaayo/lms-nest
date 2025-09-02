import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSecurity } from './app/security/setup-security.middleware';
import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Debug environment variables before app creation
  console.log('=== ENVIRONMENT VARIABLES ===');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Exists' : 'Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('=============================');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Debug ConfigService values
  console.log('=== CONFIG SERVICE VALUES ===');
  console.log(
    'DATABASE_URL from ConfigService:',
    configService.get('DATABASE_URL') ? 'Exists' : 'Missing',
  );
  console.log('=============================');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf; // ⚡ store raw Buffer
      },
    }),
  );

  // Enable CORS for your frontend
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://your-frontend-domain.com', // prod (when deployed)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  setupSecurity(app.getHttpAdapter().getInstance());
  console.log('=== CONFIG SERVICE VALUES ===');
  console.log(
    'DATABASE_URL from ConfigService:',
    configService.get('DATABASE_URL') ? 'Exists' : 'Missing',
  );
  console.log('=============================');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
