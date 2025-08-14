import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSecurity } from './app/security/setup-security.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSecurity(app.getHttpAdapter().getInstance());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
