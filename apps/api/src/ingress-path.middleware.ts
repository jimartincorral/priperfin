import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IngressPathMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressPathMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const originalUrl = req.originalUrl || req.url;
    
    // 1. Check for Home Assistant Ingress Header (Standard method)
    // Home Assistant strips the prefix but sends it in this header
    const ingressHeader = req.headers['x-ingress-path'] as string;
    
    if (ingressHeader) {
      this.logger.log(`Found X-Ingress-Path header: ${ingressHeader}`);
      
      // Store ingress path for AppController to use
      // We don't need to rewrite URL because HA already stripped it (as confirmed by logs receiving '/')
      (req as any).ingressPath = ingressHeader;
      
      return next();
    }

    // 2. Fallback: Detect Ingress path in URL (for setups that don't strip it)
    // Pattern: /api/hassio_ingress/{token}
    const ingressMatch = originalUrl.match(/^(\/api\/hassio_ingress\/[^/]+)(.*)/);
    
    if (ingressMatch) {
      const ingressPrefix = ingressMatch[1];
      const remainingPath = ingressMatch[2] || '/';
      
      // Store ingress path for AppController to use
      (req as any).ingressPath = ingressPrefix;
      
      // Rewrite URL to strip ingress prefix so NestJS routing works standardly
      req.url = remainingPath;
      
      this.logger.log(`Rewrote Ingress URL: ${originalUrl} -> ${req.url}`);
      this.logger.log(`Captured Ingress Prefix: ${ingressPrefix}`);
    } else {
      // Log for debugging non-ingress requests
      // Also logging headers to debug if we missed the header
      // this.logger.debug(`No Ingress detected. Headers: ${JSON.stringify(req.headers)}`);
    }
    
    next();
  }
}
