import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';

import { AdminUserService } from './admin-users.service';
import { AdminAdminsService } from './admin-admins.service';

import { AdminAdminsController } from './admin-admins.controller';
import { AdminUserController } from './admin-user.controller';

import { UserAdmin } from './admin.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAdmin, User]), EmailModule],
  providers: [AdminUserService, AdminAdminsService],
  controllers: [AdminUserController, AdminAdminsController],
  exports: [AdminUserService, AdminAdminsService],
})
export class AdminModule {}
