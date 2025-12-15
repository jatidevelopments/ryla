import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerHelper } from '../logger/logger.helper';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const url = request.url;

    this.logger.log(LoggerHelper.formatRequest(method, url));

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode;
        const timeTaken = Date.now() - now;
        this.logger.log(
          LoggerHelper.formatResponse(method, url, statusCode, timeTaken),
        );
      }),
      catchError((error) => {
        const statusCode = error.status || 500;
        const errorMessage = error.message || 'Internal server error';
        const timeTaken = Date.now() - now;

        this.logger.error(
          LoggerHelper.formatError(
            method,
            url,
            statusCode,
            timeTaken,
            errorMessage,
          ),
        );

        return throwError(() => error);
      }),
    );
  }
}

