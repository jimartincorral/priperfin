import { Controller, Get, Req, Res, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private indexHtmlCache: string | null = null;
  private staticPath: string;

  constructor(private readonly appService: AppService) {
    // Get static path from environment or default
    this.staticPath = process.env.STATIC_PATH || '/app/client';
  }

  @Get()
  getRoot(@Req() req: Request, @Res() res: Response) {
    // Check if this is an API request (has Accept: application/json)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json')) {
      return res.json(this.appService.getHello());
    }

    // Serve HTML with base tag injection for Ingress
    try {
      // Detect Home Assistant Ingress path
      const ingressMatch = req.originalUrl.match(
        /^(\/api\/hassio_ingress\/[^\/]+)/,
      );
      const ingressPath = ingressMatch ? ingressMatch[1] : null;

      this.logger.log(`Root request - URL: ${req.originalUrl}`);
      this.logger.log(`Ingress path detected: ${ingressPath || 'none (standalone mode)'}`);

      // Read index.html
      if (!this.indexHtmlCache) {
        const indexPath = join(this.staticPath, 'index.html');
        this.logger.log(`Reading index.html from: ${indexPath}`);
        
        if (!existsSync(indexPath)) {
          this.logger.error(`index.html not found at: ${indexPath}`);
          return res.status(404).send('index.html not found');
        }
        
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
          this.logger.log(`✓ Injected base tag: ${baseTag}`);
        }
      } else {
        this.logger.log('Standalone mode - no base tag needed');
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      this.logger.error('Error serving index.html:', error);
      res.status(500).send('Error loading application');
    }
  }

  @Get('health')
  getHealth(): object {
    return { status: 'ok' };
  }
}
