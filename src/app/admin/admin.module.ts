import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailModule } from '../email/email.module';
import { CourseModule } from '../course/course.module';

import { AdminUserService } from './services/admin-users.service';
import { AdminAdminsService } from './services/admin-admins.service';
import { AdminCoursesService } from './services/admin-course.service';

import { AdminAdminsController } from './controllers/admin-admins.controller';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminCoursesController } from './controllers/admin-courses.controller';

import { UserAdmin } from './admin.entity';
import { User } from '../user/user.entity';
import { AdminAuthController } from './controllers/admin-auth.controller';
import { AdminAuthService } from './services/admin-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAdmin, User]),
    EmailModule,
    CourseModule,
  ],
  providers: [
    AdminUserService,
    AdminAdminsService,
    AdminCoursesService,
    AdminAuthService,
  ],
  controllers: [
    AdminUserController,
    AdminAdminsController,
    AdminCoursesController,
    AdminAuthController,
  ],
  exports: [],
})
export class AdminModule {}
