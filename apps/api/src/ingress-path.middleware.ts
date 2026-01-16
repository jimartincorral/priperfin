import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IngressPathMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressPathMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Normalize path to remove duplicate slashes (e.g., //assets -> /assets)
    // This happens when base tag is "./" and current path is "/"
    const originalPath = req.path;
    if (originalPath.includes('//')) {
      req.url = req.url.replace(/\/+/g, '/');
      this.logger.log(`Normalized path: ${originalPath} -> ${req.path}`);
    }
    
    // Detect if we're behind a proxy (Home Assistant Ingress)
    // HA strips the /api/hassio_ingress/{token} prefix before forwarding,
    // so we can't detect it from the URL. Instead, we look for proxy headers.
    const xForwardedFor = req.headers['x-forwarded-for'];
    const xRealIp = req.headers['x-real-ip'];
    const xForwardedHost = req.headers['x-forwarded-host'];
    
    // If any proxy header is present, we're likely in Ingress mode
    if (xForwardedFor || xRealIp || xForwardedHost) {
      // Mark as Ingress mode with empty string
      // Empty string means "use relative base tag" (we can't know the actual token)
      (req as any).ingressPath = '';
      
      this.logger.log('Ingress mode detected via proxy headers');
      this.logger.log(`  X-Forwarded-For: ${xForwardedFor || 'none'}`);
      this.logger.log(`  X-Real-IP: ${xRealIp || 'none'}`);
      this.logger.log(`  X-Forwarded-Host: ${xForwardedHost || 'none'}`);
    } else {
      // No proxy headers detected - running in standalone mode
      this.logger.log('No Ingress prefix detected in URL: ' + req.path);
    }
    
    next();
  }
}
