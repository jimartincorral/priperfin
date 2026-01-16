import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IngressPathMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressPathMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Just log the request for debugging
    // No need to detect Ingress mode or inject base tags
    // Home Assistant's Ingress proxy handles all path translation automatically
    this.logger.log(`Request: ${req.method} ${req.path}`);
    
    next();
  }
}
