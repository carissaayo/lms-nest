import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Returns TypeORM DataSourceOptions based on environment.
 * Handles both production (DATABASE_URL) and local development.
 */
export const getDataSourceOptions = (
  configService?: ConfigService,
): DataSourceOptions => {
  // Get DATABASE_URL - priority: env var > config service
  const databaseUrl =
    process.env.DATABASE_URL || configService?.get<string>('DATABASE_URL');

  // Always use source files for development, only use dist for actual production deployment
  const entitiesPath = join(__dirname, '../**/*.entity.{ts,js}');
  const migrationsPath = join(__dirname, '../migrations/*.{ts,js}');

  // Production configuration with DATABASE_URL
  if (databaseUrl && isProd) {
    console.log('🔧 Using DATABASE_URL for production connection');

    // Parse the DATABASE_URL to extract components for debugging
    try {
      const url = new URL(databaseUrl);
      console.log('Database URL details:', {
        host: url.hostname,
        port: url.port,
        database: url.pathname.replace('/', ''),
        username: url.username,
        password: url.password ? '***' : 'none',
      });
    } catch (e) {
      console.error('❌ Invalid DATABASE_URL format:', e.message);
      // Fall back to individual parameters if URL is invalid
    }

    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [entitiesPath],
      migrations: [migrationsPath],
      synchronize: false,
      logging: false, // Disable logging in production
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false, // Required for Render PostgreSQL
        },
      },
    };
  }

  // Local development configuration
  console.log('🔧 Using local development database configuration');
  return {
    type: 'postgres',
    host:
      process.env.DB_HOST ||
      configService?.get<string>('DB_HOST') ||
      configService?.get<string>('DATABASE_HOST') ||
      'localhost',
    port: Number(
      process.env.DB_PORT ||
        configService?.get<number>('DB_PORT') ||
        configService?.get<number>('DATABASE_PORT') ||
        5432,
    ),
    username:
      process.env.DB_USER ||
      configService?.get<string>('DB_USER') ||
      configService?.get<string>('DATABASE_USER') ||
      'postgres',
    password:
      process.env.DB_PASS ||
      configService?.get<string>('DB_PASS') ||
      configService?.get<string>('DATABASE_PASSWORD') ||
      '',
    database:
      process.env.DB_NAME ||
      configService?.get<string>('DB_NAME') ||
      configService?.get<string>('DATABASE_NAME') ||
      'lms-database',
    entities: [entitiesPath],
    migrations: [migrationsPath],
    synchronize: false,
    logging: true,
    ssl: false,
  };
};

/**
 * For NestJS: create a DataSource instance using optional ConfigService
 */
export const createDataSource = (configService?: ConfigService): DataSource => {
  const options = getDataSourceOptions(configService);
  return new DataSource(options);
};

/**
 * For TypeORM CLI - uses environment variables directly
 */
const AppDataSource = new DataSource(getDataSourceOptions());

export default AppDataSource;
