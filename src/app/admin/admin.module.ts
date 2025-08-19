import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAdmin } from './admin.entity';
import { AdminUserService } from './admin-users.service';
import { AdminUserController } from './admin-user.controller';
import { EmailModule } from '../email/email.module';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserAdmin, User]), EmailModule],
  providers: [AdminUserService],
  controllers: [AdminUserController],
  exports: [AdminUserService],
})
export class AdminModule {}
