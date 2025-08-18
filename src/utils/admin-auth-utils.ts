import { Repository } from 'typeorm';
import { Request } from 'express';
import { generateAccessToken, generateRefreshToken } from './jwt-utils';
import config from 'src/app/config/config';
import { customError } from 'libs/custom-handlers';
import { User } from 'src/app/user/user.entity';
import { ProfileInterface } from 'src/app/auth/auth.interface';
import { UserAdmin } from 'src/app/admin/admin.entity';
import { AdminProfileInterface } from 'src/app/admin/admin.interface';
export interface CustomRequest extends Request {
  verifyAccessToken?: 'nil' | 'failed' | 'success';
  verifyAccessTokenMessage?: string | undefined;
  userId?: string;
  token?: string;
  files?: any;
}

const appConfig = config();

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

  throw customError.unauthorized('Invalid credentials');
}

// Generate access and refresh tokens
// export const generateToken = async (user: User, req: CustomRequest) => {
//   const JWT_REFRESH_TOKEN_SECRET = appConfig.jwt.refresh_token;
//   const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;

//   const clientIpAddress = req.ip;
//   const userAgent = req.headers['user-agent'];

//   const token = await generateAccessToken(
//     user.id,
//     user.role,
//     JWT_ACCESS_TOKEN_SECRET,
//   );

//   const refreshToken = await generateRefreshToken(
//     user.id,
//     user.role,
//     JWT_REFRESH_TOKEN_SECRET,
//   );

//   const session = {
//     ipAddress: clientIpAddress || '',
//     userAgent: userAgent || '',
//     date: new Date(Date.now()),
//     refreshtoken: refreshToken,
//     active: true,
//   };

//   return {
//     token,
//     refreshToken,
//     session,
//   };
// };

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
