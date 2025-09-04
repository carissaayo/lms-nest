import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSecurity } from './app/security/setup-security.middleware';
import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import { ConfigService } from '@nestjs/config';
import { createDataSource } from './app/config/database.config';

async function bootstrap() {
  // Debug environment variables before app creation
  console.log('=== ENVIRONMENT VARIABLES ===');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Exists' : 'Missing');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('=============================');
  // Run migrations in production before starting the app
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🚀 Running database migrations in production...');
      const dataSource = createDataSource();
      await dataSource.initialize();
      await dataSource.runMigrations();
      await dataSource.destroy();
      console.log('✅ Database migrations completed successfully!');
    } catch (migrationError) {
      console.error('❌ Database migration failed:', migrationError);
      // Don't crash the app - maybe migrations were already run
      console.log('⚠️  Continuing application startup...');
    }
  }
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
