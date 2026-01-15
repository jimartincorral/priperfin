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
  app.setGlobalPrefix('api', {
    exclude: [
      '/', // Root HTML
      'health', // Health check
      'assets/(.*)', // Static assets (JS, CSS, etc.)
      '{*}', // Catch-all for SPA routes (handled by AppController)
    ],
  });

  // Apply Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'], // Lit requires inline styles, Google Fonts
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'], // Google Fonts
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Home Assistant compatibility
      hsts: false, // Disabled (supports both HTTP and HTTPS)
      noSniff: true,
      xssFilter: true,
      frameguard: { action: 'deny' },
    }),
  );

  // Configure CORS with restricted origins
  // In development, allow common local dev server ports
  // In production, set CORS_ORIGINS environment variable
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Allow localhost and private network IPs (this is a self-hosted app)
      const isLocalhost =
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');
      const isPrivateNetwork =
        /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(
          origin,
        );
      if (allowedOrigins.includes(origin) || isLocalhost || isPrivateNetwork) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
