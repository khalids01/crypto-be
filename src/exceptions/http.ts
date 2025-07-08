import {
  HttpException,
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { env } from 'src/env';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: Logger) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    this.logger.error(
      `${request.method} ${request.originalUrl} ${status} ERROR : ${exception.message}`,
    );

    if (env.NODE_ENV !== 'production') {
      console.table(exception?.response);
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      errors: exception?.response?.message,
    });
  }
}
