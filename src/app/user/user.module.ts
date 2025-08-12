import { Module } from '@nestjs/common';
import { UsersService } from './user.service';

@Module({
  imports: [],

  controllers: [
    // UsersController
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UserModule {}
