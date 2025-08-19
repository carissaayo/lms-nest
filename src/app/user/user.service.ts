import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';

import { RegisterDto } from '../auth/auth.dto';
import { UpdateUserDTO } from './user.dto';
import { ProfileInterface } from '../auth/auth.interface';

import { CustomRequest, GET_PROFILE } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async create(dto: RegisterDto) {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }

  async updateUser(updateProfile: UpdateUserDTO, req: CustomRequest) {
    console.log('viewProfile');

    const user = await this.usersRepo.findOne({
      where: { id: req.userId },
    });

    if (!user) {
      throw customError.forbidden('Access Denied');
    }

    // build profile
    const profile: ProfileInterface = GET_PROFILE(user);

    await this.usersRepo.save(user);

    return {
      accessToken: req.token || '',
      profile,
      message: 'Profile fetched successfully',
    };
  }

  async viewProfile(req: CustomRequest) {
    console.log('viewProfile');

    const user = await this.usersRepo.findOne({
      where: { id: req.userId },
    });

    if (!user) {
      throw customError.forbidden('Access Denied');
    }
    const profile: ProfileInterface = GET_PROFILE(user);

    return {
      accessToken: req.token || '',
      profile,
      message: 'Profile fetched successfully',
    };
  }
}
