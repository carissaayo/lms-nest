import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSecurity } from './app/security/setup-security.middleware';
import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Debug: check if DATABASE_URL is available
  console.log('DATABASE_URL:', configService.get('DATABASE_URL'));
  console.log('NODE_ENV:', configService.get('NODE_ENV'));
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
  setupSecurity(app.getHttpAdapter().getInstance());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
