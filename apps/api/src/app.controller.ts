import { Controller, Get, Req, Res, Logger, All } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

// Empty path means this controller is at root, not under /api prefix
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private indexHtmlCache: string | null = null;
  private staticPath: string;

  constructor(private readonly appService: AppService) {
    // Get static path from environment or default
    this.staticPath = process.env.STATIC_PATH || '/app/client';
    this.logger.log(`Static files will be served from: ${this.staticPath}`);
  }

  @Get('health')
  getHealth(): object {
    return { status: 'ok' };
  }

  // Serve static assets (CSS, JS, images, etc.)
  @Get('assets/*')
  async getAsset(@Req() req: Request, @Res() res: Response) {
    try {
      // Get the requested file path
      const requestedPath = req.path; // e.g., /assets/index-BIidnPpS.js
      const filePath = join(this.staticPath, requestedPath);

      this.logger.log(`Asset request: ${requestedPath}`);
      this.logger.log(`Resolved to: ${filePath}`);

      if (!existsSync(filePath)) {
        this.logger.error(`Asset not found: ${filePath}`);
        return res.status(404).send('Not found');
      }

      // Check if it's a file (not a directory)
      const stats = statSync(filePath);
      if (!stats.isFile()) {
        this.logger.error(`Not a file: ${filePath}`);
        return res.status(404).send('Not found');
      }

      // Determine content type based on file extension
      const ext = extname(filePath).toLowerCase();
      const contentTypes: Record<string, string> = {
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';
      this.logger.log(`Serving ${filePath} as ${contentType}`);

      // Read and send the file
      const fileContent = readFileSync(filePath);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache assets for 1 year
      res.send(fileContent);
    } catch (error) {
      this.logger.error('Error serving asset:', error);
      res.status(500).send('Error loading asset');
    }
  }

  // Serve root HTML and catch-all for SPA routes
  @Get('*')
  getRoot(@Req() req: Request, @Res() res: Response) {
    // Check if this is an API request (has Accept: application/json)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json') && req.path === '/') {
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
      this.logger.log(`Path: ${req.path}`);
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
}
