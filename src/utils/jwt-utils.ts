import config from 'src/app/config/config';

const jwt = require('jsonwebtoken');
const appConfig = config();
// JWT Generate Token
export const generateAccessToken = async (
  user: string,
  type: string,
  secret: string,
) => {
  try {
    console.log('CONFIRMED: ACCESS TOKEN GENERATED!');
    const tenMinutes = appConfig.jwt.duration10m;
    const thirtyDays = appConfig.jwt.duration30d;
    const ninetyDays = appConfig.jwt.duration90d;
    const tokenExpire = '1d';
    //   type === 'mins' ? tenMinutes : type === 'month' ? thirtyDays : ninetyDays;

    return jwt.sign(
      {
        id: user,
      },
      secret,
      {
        expiresIn: tokenExpire,
      },
    );
  } catch (err: any) {
    console.log('FAILED TO GENERATE ACCESS TOKEN', err.message);
  }
};

// JWT Generate Token
export const generateRefreshToken = async (user: string, secret: string) => {
  return jwt.sign(
    {
      id: user,
    },
    secret,
  );
};

// JWT Check if refresh token is authenticated
export const verifyRefreshToken = async (
  refreshToken: string,
  sessions: string[],
  accessTokenSecret: string,
  refreshTokenSecret: string,
): Promise<any> => {
  console.log('VERIFY REFRESH TOKEN REACHED', refreshToken, sessions);
  if (refreshToken === undefined || refreshToken === null)
    return {
      status: 'failed',
      message: 'Access denied. Please submit refresh token',
    };

  if (!sessions.includes(refreshToken)) {
    console.log('SESSION TOKENS NOT IN REFRESH');
    return {
      status: 'failed',
      message: 'Token expired. Please re-authorize',
    };
  }

  // Need to promisify jwt.verify since we're using it in an async function
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
          console.log('ACCESS TOKEN ID', token.id);
          const accessToken = await generateAccessToken(
            token.id,
            'mins',
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
