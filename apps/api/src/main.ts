import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { json, urlencoded } from 'express'; // Import express body parsers
import { join } from 'path';
import * as multer from 'multer'; // Import multer
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Set global prefix for API routes, but exclude AppController which serves static files
  // NOTE: The exclude list is for routes WITHOUT the /api prefix
  // These routes are handled by AppController to serve the SPA HTML
  // API controllers (categories, rules, settings, etc.) still use /api prefix
  app.setGlobalPrefix('api', {
    exclude: [
      '', // Root path (/)
      '/', // Also explicitly exclude /
      'health', // Health check
      'assets/*', // Static assets (JS, CSS, etc.)
    ],
  });

  // Apply Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to prevent blocking assets in Ingress
      crossOriginEmbedderPolicy: false, // Home Assistant compatibility
      hsts: false, // Disabled (supports both HTTP and HTTPS)
      noSniff: true,
      xssFilter: true,
      frameguard: { action: 'deny' },
    }),
  );

  // Enable permissive CORS
  // Since this is a self-hosted app usually accessed via local IP or Ingress,
  // we can be more permissive to prevent blocking legitimate requests.
  app.enableCors({
    origin: true, // Reflects the request origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  // Configure express to handle JSON and URL-encoded bodies (reduced from 50mb for security)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Register Multer for handling multipart/form-data, if not already handled by platform-express
  // Note: @nestjs/platform-express typically handles this, but explicitly calling `multer` can prevent issues
  // or allow for custom configuration if needed globally.
  // For FileInterceptor to work, `app.use(multer().any())` is sometimes used, but not necessary with FileInterceptor.

  await app.listen(process.env.PORT ?? 3000, '::');
}
bootstrap();
