import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SecurityModule } from 'src/security/security.module';

import { UsersService } from './user.service';

import { UsersController } from './user.controller';
import { User, UserSchema } from 'src/models/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        SecurityModule,
    
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UserModule {}
