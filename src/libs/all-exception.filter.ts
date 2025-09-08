/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrowException } from './custom-handlers';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_SERVER_ERROR';
    let data: any = null;

    if (exception instanceof ThrowException) {
      // ✅ Your custom error
      status = exception.statusCode;
      message = exception.message;
      errorCode = exception.errorCode ?? errorCode;
      data = exception.data ?? null;
    } else if (exception instanceof HttpException) {
      // ✅ Nest built-in HTTP errors
      status = exception.getStatus();
      const res: any = exception.getResponse();
      message = res.message || exception.message;
    } else if (exception instanceof Error) {
      // ✅ Regular JS errors
      message = exception.message;
    }

    // log error
    this.logger.error(
      `[${request.method}] ${request.url} → ${message}`,
      (exception as any).stack,
    );

    // send structured response
    response.status(status).json({
      status: status >= 500 ? 'error' : 'failed',
      statusCode: status,
      message,
      errorCode,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
