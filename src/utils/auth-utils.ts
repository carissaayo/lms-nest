import { Repository } from 'typeorm';
import { Request } from 'express';
import { generateAccessToken, generateRefreshToken } from './jwt-utils';
import config from 'src/app/config/config';
import { customError } from 'libs/custom-handlers';
import { User } from 'src/app/user/user.entity';
import { ProfileInterface } from 'src/app/auth/auth.interface';
import { UserAdmin } from 'src/app/admin/admin.entity';
export interface CustomRequest extends Request {
  verifyAccessToken?: 'nil' | 'failed' | 'success';
  verifyAccessTokenMessage?: string | undefined;
  userId?: string;
  token?: string;
  files?: any;
}

const appConfig = config();

/**
 * Handles failed authentication attempts for a user.
 * Locks account temporarily after 5 or more failed attempts.
 *
 * @param user - The user entity
 * @param usersRepo - TypeORM repository for saving updates
 */
export async function handleFailedAuthAttempt(
  user: User | UserAdmin,
  usersRepo: Repository<User>,
): Promise<never> {
  if (user.failedAuthAttempts >= 5) {
    user.nextAuthDate = new Date(
      Date.now() + 120000 * user.failedAuthAttempts, // 2 mins × attempts
    );
  }

  user.failedAuthAttempts += 1;

  await usersRepo.save(user);

  throw customError.unauthorized('Invalid credentials');
}

// Generate access and refresh tokens
export const generateToken = async (
  user: User | UserAdmin,
  req: CustomRequest,
) => {
  const JWT_REFRESH_TOKEN_SECRET = appConfig.jwt.refresh_token;
  const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;

  const clientIpAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const token = await generateAccessToken(
    user.id,
    user.role,
    JWT_ACCESS_TOKEN_SECRET,
  );

  const refreshToken = await generateRefreshToken(
    user.id,
    user.role,
    JWT_REFRESH_TOKEN_SECRET,
  );

  const session = {
    ipAddress: clientIpAddress || '',
    userAgent: userAgent || '',
    date: new Date(Date.now()),
    refreshtoken: refreshToken,
    active: true,
  };

  return {
    token,
    refreshToken,
    session,
  };
};

export const GET_PROFILE = (user: any): ProfileInterface => {
  return {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailVerified: user.emailVerified,
    walletBalance: user.walletBalance,
    phoneNumber: user.phoneNumber,
    role: user.role,
    courses: user.courses,
  };
};
