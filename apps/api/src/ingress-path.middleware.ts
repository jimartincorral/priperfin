import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IngressPathMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressPathMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Check for X-Ingress-Path header which HA sends with the base path
    const ingressPath = req.headers['x-ingress-path'] as string;
    
    if (ingressPath) {
      this.logger.log(`Ingress detected: X-Ingress-Path = ${ingressPath}`);
      (req as any).ingressPath = ingressPath;
    } else {
      this.logger.log(`Standalone mode - no X-Ingress-Path header`);
    }
    
    next();
  }
}
