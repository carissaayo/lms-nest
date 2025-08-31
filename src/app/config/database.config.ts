import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

export const getDataSourceOptions = (
  configService: ConfigService,
): DataSourceOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (databaseUrl) {
    // Use DATABASE_URL for production (Render)
    return {
      type: 'postgres',
      url: databaseUrl,
      entities: [join(__dirname, '../**/*.entity.{ts,js}')],
      migrations: [join(__dirname, '../migrations/*.{ts,js}')],
      synchronize: false,
      logging: true,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    };
  } else {
    // Fallback to individual config for local development
    return {
      type: 'postgres',
      host: configService.get<string>('DATABASE_HOST'),
      port: configService.get<number>('DATABASE_PORT'),
      username: configService.get<string>('DATABASE_USER'),
      password: configService.get<string>('DATABASE_PASSWORD'),
      database: configService.get<string>('DATABASE_NAME'),
      entities: [join(__dirname, '../**/*.entity.{ts,js}')],
      migrations: [join(__dirname, '../migrations/*.{ts,js}')],
      synchronize: false,
      logging: true,
    };
  }
};

// Create the DataSource instance separately
export const createDataSource = (configService: ConfigService): DataSource => {
  const options = getDataSourceOptions(configService);
  return new DataSource(options);
};

export default createDataSource;
