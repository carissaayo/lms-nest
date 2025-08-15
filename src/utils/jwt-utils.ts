import config from 'src/app/config/config';
import { User, UserRole } from 'src/app/user/user.entity';
import * as jwt from 'jsonwebtoken';

const appConfig = config();

export interface JwtPayload {
  id: string;
  role: UserRole;
}

// JWT Generate Access Token
export const generateAccessToken = async (
  id: string,
  role: UserRole,
  secret: string,
) => {
  try {
    console.log('CONFIRMED: ACCESS TOKEN GENERATED!');
    const tokenExpire = '1d'; // You can replace with appConfig.jwt.duration10m etc.
    return jwt.sign({ id, role } as JwtPayload, secret, {
      expiresIn: tokenExpire,
    });
  } catch (err: any) {
    console.error('FAILED TO GENERATE ACCESS TOKEN', err.message);
    throw err;
  }
};

// JWT Generate Refresh Token
export const generateRefreshToken = async (
  id: string,
  role: UserRole,
  secret: string,
) => {
  return jwt.sign({ id, role } as JwtPayload, secret);
};

// JWT Verify Refresh Token and Re-Issue Access Token
export const verifyRefreshToken = async (
  refreshToken: string,
  sessions: string[],
  accessTokenSecret: string,
  refreshTokenSecret: string,
): Promise<{ status: string; message?: string; newToken?: string }> => {
  console.log('VERIFY REFRESH TOKEN REACHED', refreshToken, sessions);

  if (!refreshToken) {
    return {
      status: 'failed',
      message: 'Access denied. Please submit refresh token',
    };
  }

  if (!sessions.includes(refreshToken)) {
    console.log('SESSION TOKENS NOT IN REFRESH');
    return { status: 'failed', message: 'Token expired. Please re-authorize' };
  }

  return new Promise((resolve) => {
    jwt.verify(
      refreshToken,
      refreshTokenSecret,
      async (err: any, token: any) => {
        if (err) {
          console.log('REFRESH TOKEN FAILED');
          resolve({
            status: 'failed',
            message: 'Access denied. Please re-authorize token',
          });
        } else {
          console.log('ACCESS TOKEN PAYLOAD', token);
          const accessToken = await generateAccessToken(
            token.id,
            token.role,
            accessTokenSecret,
          );
          console.log('REFRESH ACCESS TOKEN GENERATED', accessToken);
          resolve({
            status: 'success',
            newToken: accessToken,
          });
        }
      },
    );
  });
};
