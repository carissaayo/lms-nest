import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '../auth/auth.module';

// import { User, UserSchema } from '../user/user.schema';
// import { Loan, LoanSchema } from '../loan/loan.schema';

import { EmailVerifiedGuard } from './middleware/verified.guard';
import { JwtStrategy } from './middleware/jwt.strategy';
import { JwtAuthGuard } from './middleware/jwt.guard';
import { RolesGuard } from './middleware/role.guard';
// import { AnalyticsModule } from '../analytic/analytics.module';
// import { RedisService } from './services/redis.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
    }),
    MongooseModule.forFeature([
      // { name: User.name, schema: UserSchema },
      // { name: Loan.name, schema: LoanSchema },
    ]),
  ],

  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: EmailVerifiedGuard,
    },
    JwtStrategy,
    RolesGuard,
    EmailVerifiedGuard,
  ],
  exports: [],
})
export class DomainModule {}
