import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import config from './app/config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './app/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
