import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/auth.dto';
import { CustomRequest, GET_PROFILE } from 'src/utils/auth-utils';
import { customError } from 'libs/custom-handlers';
import { ProfileInterface } from '../auth/auth.interface';
import { UpdateUserDTO } from './user.dto';

interface ViewProfileResponse {
  accessToken: string;
  profile: ProfileInterface;
  message: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: RegisterDto) {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
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

    await this.usersRepo.save(user);
    return {
      accessToken: req.token || '',
      profile,
      message: 'Profile fetched successfully',
    };
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
}
