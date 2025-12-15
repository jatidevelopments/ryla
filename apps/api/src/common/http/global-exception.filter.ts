import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import chalk from 'chalk';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let messages: string | string[];
    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus();
      messages = (exception as any).response?.message ?? exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      messages = (exception as any).message || 'Internal server error';
    }

    messages = Array.isArray(messages) ? messages : [messages];

    const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
    this.logger.error(
      `${chalk.red('✗')} ${chalk.red.bold(`[${status}]`)} ${chalk.red(errorMsg)} ${chalk.gray(`${request.method} ${request.url}`)}`,
      (exception as any).stack,
    );

    response.status(status).json({
      statusCode: status,
      messages,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

