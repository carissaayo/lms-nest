import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { UsersService } from '../user/user.service';
import { EmailModule } from '../email/email.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { UserAdmin } from '../admin/admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),

    PassportModule,
    EmailModule,
    TypeOrmModule.forFeature([UserAdmin, User]),
  ],

  controllers: [AuthController, AdminAuthController],
  providers: [AuthService, JwtStrategy, AdminAuthService],
  exports: [AuthService, AdminAuthService],
})
export class AuthModule {}
