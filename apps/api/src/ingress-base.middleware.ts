import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class IngressBaseMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressBaseMiddleware.name);
  private indexHtmlCache: string | null = null;
  private staticPath: string;

  constructor() {
    // Get static path from environment or default
    this.staticPath = process.env.STATIC_PATH || '/app/client';
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Only intercept requests for the root HTML file
    const isHtmlRequest =
      req.path === '/' ||
      req.path === '/index.html' ||
      (!req.path.startsWith('/api') &&
        !req.path.includes('.') &&
        req.method === 'GET');

    if (!isHtmlRequest) {
      return next();
    }

    try {
      // Detect Home Assistant Ingress path
      const ingressMatch = req.originalUrl.match(
        /^(\/api\/hassio_ingress\/[^\/]+)/,
      );
      const ingressPath = ingressMatch ? ingressMatch[1] : null;

      this.logger.log(`Request URL: ${req.originalUrl}`);
      this.logger.log(`Ingress path detected: ${ingressPath || 'none'}`);

      // Read index.html
      if (!this.indexHtmlCache) {
        const indexPath = join(this.staticPath, 'index.html');
        this.logger.log(`Reading index.html from: ${indexPath}`);
        this.indexHtmlCache = readFileSync(indexPath, 'utf-8');
      }

      let html = this.indexHtmlCache;

      // Inject <base> tag if in Ingress mode
      if (ingressPath) {
        // Check if <base> tag already exists
        if (!html.includes('<base')) {
          // Inject <base href="{ingressPath}/"> after <head>
          const baseTag = `<base href="${ingressPath}/">`;
          html = html.replace('<head>', `<head>\n  ${baseTag}`);
          this.logger.log(`Injected base tag: ${baseTag}`);
        }
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      this.logger.error('Error serving index.html:', error);
      next(error);
    }
  }
}
