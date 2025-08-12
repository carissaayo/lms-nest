import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // or 'mysql'
      host: 'localhost',
      port: 5432,
      username: 'postgres', // change
      password: 'password', // change
      database: 'lms_db',
      autoLoadEntities: true,
      synchronize: true, // ❌ Turn off in production, use migrations instead
    }),
  ],
})
export class DatabaseModule {}
