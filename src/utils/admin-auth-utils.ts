import { Repository } from 'typeorm';
import { Request } from 'express';

import { customError } from 'src/libs/custom-handlers';

import { UserAdmin } from 'src/app/admin/admin.entity';
import { AdminProfileInterface } from 'src/app/admin/admin.interface';
export interface CustomRequest extends Request {
  verifyAccessToken?: 'nil' | 'failed' | 'success';
  verifyAccessTokenMessage?: string | undefined;
  userId?: string;
  token?: string;
  files?: any;
}

/**
 * Handles failed authentication attempts for an admin.
 * Locks account temporarily after 5 or more failed attempts.
 *
 * @param admin - The Admin entity
 * @param AdminRepo - TypeORM repository for saving updates
 */
export async function handleFailedAuthAttempt(
  admin: UserAdmin,
  adminRepo: Repository<UserAdmin>,
): Promise<never> {
  if (admin.failedAuthAttempts >= 5) {
    admin.nextAuthDate = new Date(
      Date.now() + 120000 * admin.failedAuthAttempts, // 2 mins × attempts
    );
  }

  admin.failedAuthAttempts += 1;

  await adminRepo.save(admin);

  throw customError.unauthorized('Invalid credentials', 401);
}

export const GET_ADMIN_PROFILE = (admin: UserAdmin): AdminProfileInterface => {
  return {
    userId: admin.id,
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    emailVerified: admin.emailVerified,
    permissions: admin.permissions,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
  };
};
