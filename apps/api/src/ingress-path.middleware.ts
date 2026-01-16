import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IngressPathMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressPathMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl || req.url;
    
    // Detect Home Assistant Ingress path
    // Pattern: /api/hassio_ingress/{token}
    // We capture the prefix to inject into HTML, and strip it for routing
    const ingressMatch = originalUrl.match(/^(\/api\/hassio_ingress\/[^/]+)(.*)/);
    
    if (ingressMatch) {
      const ingressPrefix = ingressMatch[1];
      const remainingPath = ingressMatch[2] || '/';
      
      // Store ingress path for AppController to use
      (req as any).ingressPath = ingressPrefix;
      
      // Rewrite URL to strip ingress prefix so NestJS routing works standardly
      // This ensures controllers (like @Get('categories')) match correctly
      // even when accessed via Ingress URL
      req.url = remainingPath;
      
      // this.logger.verbose(`Rewrote Ingress URL: ${originalUrl} -> ${req.url}`);
    }
    
    next();
  }
}
