// // src/auth/guards/admin-auth.guard.ts
// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   UnauthorizedException,
//   ForbiddenException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import * as jwt from 'jsonwebtoken';
// import { customError } from 'libs/custom-handlers';
// import { User } from 'src/app/user/user.entity';
// import { verifyRefreshToken } from 'src/utils/jwt-utils';
// import { Repository } from 'typeorm';

// @Injectable()
// export class AuthenticateAdminTokenGuard implements CanActivate {
//   private readonly JWT_ACCESS_TOKEN_SECRET_ADMIN = process.env
//     .JWT_ACCESS_TOKEN_SECRET_ADMIN as string;

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();

//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token || token === 'null') {
//       throw customError.forbidden(
//         'Access denied. Please include an access token',
//       );
//     }

//     try {
//       const decoded: any = jwt.verify(
//         token,
//         this.JWT_ACCESS_TOKEN_SECRET_ADMIN,
//       );
//       req.userId = decoded?.id;
//       req.token = token;
//       return true;
//     } catch (err: any) {
//       if (err.message === 'jwt expired') {
//         // Mark as expired so ReIssueAdminTokenGuard knows to act
//         req.tokenExpired = true;
//         req.decodedToken = jwt.decode(token) as { id: string };
//         req.userId = req.decodedToken?.id;
//         req.token = token;
//         return true;
//       }
//       throw customError.unauthorized(
//         'Access denied. Please re-authorize token',
//       );
//     }
//   }
// }

// @Injectable()
// export class ReIssueAdminTokenGuard implements CanActivate {
//   private readonly JWT_ACCESS_TOKEN_SECRET_ADMIN = process.env
//     .JWT_ACCESS_TOKEN_SECRET_ADMIN as string;
//   private readonly JWT_REFRESH_TOKEN_SECRET_ADMIN = process.env
//     .JWT_REFRESH_TOKEN_SECRET_ADMIN as string;

//   constructor(
//     @InjectRepository(User)
//     private readonly adminRepo: Repository<User>,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();

//     // If token wasn't expired, no need to re-issue
//     if (!req.tokenExpired) return true;

//     const refreshToken = req.headers['refreshtoken'];
//     if (!refreshToken) {
//       throw customError.unauthorized(
//         'Access denied. Please include a refresh token',
//       );
//     }

//     const user = await this.adminRepo.findById(req.userId).exec();
//     if (!user) {
//       throw customError.unauthorized('Authorization failed');
//     }

//     if (user.isActive !== true) {
//       throw customError.forbidden(
//         'Your account has been suspended. Please contact the administrator',
//       );
//     }

//     // Update last seen
//     user.lastSeen = new Date();
//     await user.save();

//     const userAgent = req.headers['user-agent'];
//     const activeSessions = user.sessions
//       .filter(
//         (s: { active: boolean; userAgent: string }) =>
//           s.active && s.userAgent === userAgent,
//       )
//       .map((s: { refreshtoken: string }) => s.refreshtoken);

//     const validSession = await verifyRefreshToken(
//       refreshToken as string,
//       activeSessions,
//       this.JWT_ACCESS_TOKEN_SECRET_ADMIN,
//       this.JWT_REFRESH_TOKEN_SECRET_ADMIN,
//     );

//     if (validSession.status === 'failed') {
//       throw customError.unauthorized(validSession.message);
//     }

//     if (validSession.status === 'success') {
//       req.token = validSession.newToken; // New Access Token
//     }

//     return true;
//   }
// }
