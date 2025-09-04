import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSecurity } from './app/security/setup-security.middleware';
import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';
import { DataSource } from 'typeorm';
import { createDataSource } from './app/config/database.config';

async function runMigrations() {
  try {
    console.log('🚀 Running database migrations...');
    const dataSource = createDataSource();
    await dataSource.initialize();

    // Check if migrations table exists first
    const hasMigrationsTable = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);

    if (!hasMigrationsTable[0].exists) {
      console.log('📋 Creating migrations table...');
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          timestamp BIGINT NOT NULL,
          name VARCHAR(255) NOT NULL,
          UNIQUE(timestamp, name)
        );
      `);
    }

    await dataSource.runMigrations();
    await dataSource.destroy();
    console.log('✅ Database migrations completed successfully!');
  } catch (migrationError) {
    console.error('❌ Database migration failed:', migrationError.message);
    console.log('⚠️  Continuing application startup...');
  }
}

async function bootstrap() {
  // Run migrations in production
  if (process.env.NODE_ENV === 'production') {
    await runMigrations();
  }

  const app = await NestFactory.create(AppModule);

  // 🔥 FIX: Enable trust proxy for Render
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

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
        req.rawBody = buf;
      },
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'https://your-frontend-domain.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  setupSecurity(app.getHttpAdapter().getInstance());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Application running on port ${port}`);
}

bootstrap();
