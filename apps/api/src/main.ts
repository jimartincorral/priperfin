import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { json, urlencoded } from 'express'; // Import express body parsers
import { join } from 'path';
import * as multer from 'multer'; // Import multer
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // NOTE: Global prefix is now handled via RouterModule in AppModule
  // This avoids conflicts with static asset serving and SPA routes
  // The API routes are mounted under /api via RouterModule

  // Apply Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled to prevent blocking assets in Ingress
      crossOriginEmbedderPolicy: false, // Home Assistant compatibility
      hsts: false, // Disabled (supports both HTTP and HTTPS)
      noSniff: true,
      xssFilter: true,
      frameguard: false, // Allow iframing (required for Home Assistant Ingress)
    }),
  );

  // Enable CORS for same-origin and localhost development
  // Ingress requests are same-origin (no CORS needed) but we allow localhost for dev
  app.enableCors({
    origin: true, // Reflects the request origin. 
    // This is required because we don't know the Home Assistant URL (origin) 
    // to allow-list it, and browsers send 'Origin' headers for POST requests even in Ingress.
    // Security is handled by IngressSecurityMiddleware which blocks non-Ingress network traffic.
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
