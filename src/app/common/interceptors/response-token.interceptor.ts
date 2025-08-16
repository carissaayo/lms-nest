import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TokenResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Expect tokens to be set on request by your auth service/middleware
    const accessToken = request.accessToken;
    const refreshToken = request.refreshToken;

    return next.handle().pipe(
      map((data) => {
        return {
          ...(accessToken && { accessToken }),
          ...(refreshToken && { refreshToken }),
          ...data,
        };
      }),
    );
  }
}
