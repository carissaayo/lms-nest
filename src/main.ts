import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSecurity } from './app/security/setup-security.middleware';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSecurity(app.getHttpAdapter().getInstance());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
