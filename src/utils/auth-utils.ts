import { Request } from 'express';
import { generateAccessToken, generateRefreshToken } from './jwt-utils';
import config from 'src/app/config/config';
import { customError } from 'src/libs/custom-handlers';
import { UserDocument } from 'src/models/user.schema';
import { ProfileInterface } from 'src/app/auth/auth.interface';
import { UserAdminDocument } from 'src/models/admin.schema';
import { Model } from 'mongoose';

export interface CustomRequest extends Request {
  verifyAccessToken?: 'nil' | 'failed' | 'success';
  verifyAccessTokenMessage?: string | undefined;
  userId?: string;
  token?: string;
  files?: any;
  ip: string; // Explicitly add ip property
  headers: any; // Explicitly add headers property
}

const appConfig = config();

/**
 * Handles failed authentication attempts for a user.
 * Locks account temporarily after 5 or more failed attempts.
 *
 * @param user - The user document (Mongoose)
 * @param userModel - Mongoose model for saving updates
 */
export async function handleFailedAuthAttempt(
  user: UserDocument,
  userModel: Model<UserDocument>,
): Promise<never> {
  if (user.failedAuthAttempts >= 5) {
    user.nextAuthDate = new Date(
      Date.now() + 120000 * user.failedAuthAttempts, // 2 mins × attempts
    );
  }

  user.failedAuthAttempts += 1;
  await user.save(); // save directly on the document

  throw customError.unauthorized('Invalid credentials');
}

// Generate access and refresh tokens
export const generateToken = async (
  user: UserDocument | UserAdminDocument,
  req: CustomRequest,
) => {
  const JWT_REFRESH_TOKEN_SECRET = appConfig.jwt.refresh_token;
  const JWT_ACCESS_TOKEN_SECRET = appConfig.jwt.access_token;

  const clientIpAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const token = await generateAccessToken(
    user.id.toString(),
    user.role,
    JWT_ACCESS_TOKEN_SECRET,
  );

  const refreshToken = await generateRefreshToken(
    user.id.toString(),
    user.role,
    JWT_REFRESH_TOKEN_SECRET,
  );

  const session = {
    ipAddress: clientIpAddress || '',
    userAgent: userAgent || '',
    date: new Date(),
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
    state: user.state,
    city: user.city,
    country: user.country,
    picture: user.picture,
    street: user.street,
    bio:user.bio,
  };
};
