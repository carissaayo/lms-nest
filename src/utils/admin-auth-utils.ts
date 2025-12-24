import { Request } from 'express';
import { Model } from 'mongoose';

import { customError } from 'src/libs/custom-handlers';

import {  UserAdminDocument } from 'src/models/admin.schema';
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
 * @param admin - The Admin document
 * @param adminModel - The Mongoose model for UserAdmin
 */
export async function handleFailedAuthAttempt(
  admin: UserAdminDocument,
  adminModel: Model<UserAdminDocument>,
): Promise<never> {
  if (admin.failedAuthAttempts >= 5) {
    admin.nextAuthDate = new Date(
      Date.now() + 120000 * admin.failedAuthAttempts, // 2 mins × attempts
    );
  }

  admin.failedAuthAttempts += 1;

  await adminModel.findByIdAndUpdate(admin._id, {
    failedAuthAttempts: admin.failedAuthAttempts,
    nextAuthDate: admin.nextAuthDate,
  });

  throw customError.unauthorized('Invalid credentials', 401);
}

/**
 * Maps an admin document to the profile interface.
 */
export const GET_ADMIN_PROFILE = (
  admin: UserAdminDocument,
): AdminProfileInterface => {
  return {
    userId: admin.id.toString(),
    firstName: admin.firstName,
    lastName: admin.lastName,
    email: admin.email,
    emailVerified: admin.emailVerified,
    permissions: admin.permissions,
    phoneNumber: admin.phoneNumber,
    role: admin.role,
    state: admin.state,
    city: admin.city,
    country: admin.country,
    picture: admin.picture,
    street: admin.street,
    bio: admin.bio,
    lastLogin:admin.lastLogin,
    createdAt:admin.createdAt,
    status:admin.status,
    postalCode:admin.postalCode
  };
};
