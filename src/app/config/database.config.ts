import { DataSource } from 'typeorm';
import { join } from 'path';
import config from './config';

const appConfig = config();
const AppDataSource = new DataSource({
  type: 'postgres',
  host: appConfig.database.host,
  port: Number(appConfig.database.port),
  username: appConfig.database.user,
  password: appConfig.database.password,
  database: appConfig.database.name,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [join(__dirname, 'src/migrations/*.{ts,js}')],
  synchronize: false, // NEVER true in production
  logging: true,
});

export default AppDataSource;
