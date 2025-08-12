import { Request } from 'express';
import { generateAccessToken, generateRefreshToken } from './jwt-utils';
import config from 'src/app/config/config';

export interface CustomRequest extends Request {
  // verifyAccessToken?: string;

  verifyAccessToken?: 'nil' | 'failed' | 'success';
  verifyAccessTokenMessage?: string | undefined;
  userId?: string | number;
  token?: string;
  files?: any;
}

const appConfig = config();
// Generate access and refresh tokens
export const generateToken = async (userId: string, req: CustomRequest) => {
  const JWT_REFRESH_TOKEN_SECRET_USER = appConfig.jwt.refresh_token;
  const JWT_ACCESS_TOKEN_SECRET_USER = appConfig.jwt.access_token;

  const clientIpAddress = req.ip;
  const userAgent = req.headers['user-agent'];

  const token = await generateAccessToken(
    userId,
    'mins',
    JWT_ACCESS_TOKEN_SECRET_USER,
  );
  const refreshtoken = await generateRefreshToken(
    userId,
    JWT_REFRESH_TOKEN_SECRET_USER,
  );

  const session = {
    ipAddress: clientIpAddress || '',
    userAgent: userAgent || '',
    date: new Date(Date.now()),
    refreshtoken,
    active: true,
  };

  return {
    token,
    refreshtoken,
    session,
  };
};
