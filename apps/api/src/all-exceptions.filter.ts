import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Log full details server-side for debugging
    this.logger.error(`Exception on ${request.method} ${request.url}: ${exception}`);
    if (exception instanceof Error) {
      this.logger.error(exception.stack);
    }

    // Prepare client-facing message - avoid exposing internal details in production
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = res;
    } else if (exception instanceof Error) {
      // Only expose detailed error messages in non-production environments
      if (!this.isProduction) {
        message = exception.message;
      }
      // In production, keep the generic "Internal server error" message
      // to avoid leaking sensitive information about the system
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
