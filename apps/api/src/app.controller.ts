import { Controller, Get, Req, Res, Logger, All, Next } from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response, NextFunction } from 'express';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

// Empty path means this controller is at root, not under /api prefix
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private staticPath: string;

  constructor(private readonly appService: AppService) {
    // Determine static path based on environment
    this.staticPath = this.resolveStaticPath();
    this.logger.log(`Static files will be served from: ${this.staticPath}`);
  }

  private resolveStaticPath(): string {
    // 1. Check environment variable
    if (process.env.STATIC_PATH) {
      this.logger.log(`Using STATIC_PATH env var: ${process.env.STATIC_PATH}`);
      return process.env.STATIC_PATH;
    }

    // 2. Check Docker path (production container)
    const dockerPath = '/app/client';
    if (existsSync(dockerPath)) {
      this.logger.log(`Using Docker path: ${dockerPath}`);
      return dockerPath;
    }

    // 3. Try to find web/dist relative to current location (development)
    const possiblePaths = [
      join(__dirname, '../..', 'web/dist'), // From apps/api/src (Dev)
      join(__dirname, '../../..', 'web/dist'), // From apps/api/dist (Built)
      join(__dirname, '../../../../web/dist'), // Deeper nesting
      join(process.cwd(), 'apps/web/dist'), // CWD based (monorepo root)
      join(process.cwd(), '../web/dist'), // CWD if in apps/api
    ];

    for (const p of possiblePaths) {
      if (existsSync(p)) {
        this.logger.log(`Found static files at: ${p}`);
        return p;
      }
    }

    // Default fallback
    this.logger.warn('Could not find static files, using default path');
    return join(process.cwd(), 'apps/web/dist');
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
      // Note: req.path contains the full path including /assets/
      const requestedPath = req.path; // e.g., /assets/index-BIidnPpS.js
      
      // Security check: prevent directory traversal
      if (requestedPath.includes('..')) {
        this.logger.error(`Security violation: directory traversal attempt in ${requestedPath}`);
        return res.status(403).send('Forbidden');
      }

      const filePath = join(this.staticPath, requestedPath);

      this.logger.log(`Asset request: ${requestedPath}`);
      this.logger.log(`Headers: ${JSON.stringify(req.headers)}`);
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
      
      // CORS Handling for Assets
      // Use wildcard to allow loading from any origin (including sandboxed iframes)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      // Do NOT set Access-Control-Allow-Credentials with wildcard
      this.logger.log('Set CORS: Access-Control-Allow-Origin: *');
      
      res.send(fileContent);
    } catch (error) {
      this.logger.error('Error serving asset:', error);
      res.status(500).send('Error loading asset');
    }
  }

  // Serve root HTML (explicit root path)
  @Get()
  getRootPath(@Req() req: Request, @Res() res: Response) {
    return this.serveHtml(req, res);
  }

  // Serve root HTML and catch-all for SPA routes
  @Get('*')
  getWildcard(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    // IMPORTANT: Skip API routes and asset routes - let specific handlers handle them
    // Normalize path to handle double slashes (e.g., //assets/... -> /assets/...)
    const normalizedPath = req.path.replace(/\/+/g, '/');
    
    if (normalizedPath.startsWith('/api/') || normalizedPath.startsWith('/api') || normalizedPath.startsWith('/assets/')) {
      this.logger.log(`Skipping ${normalizedPath.startsWith('/assets/') ? 'asset' : 'API'} route in wildcard handler: ${req.path}`);
      return next();
    }

    this.logger.log(`Wildcard handler serving HTML for: ${req.path}`);
    return this.serveHtml(req, res);
  }

  // Shared method to serve HTML with Ingress base tag injection
  private serveHtml(req: Request, res: Response) {
    // Check if this is an API request (has Accept: application/json)
    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('application/json') && req.path === '/') {
      return res.json(this.appService.getHello());
    }

    // Serve HTML with base tag injection for Ingress
    try {
      // Ingress path is now detected by IngressPathMiddleware and stored in req
      const ingressPath = (req as any).ingressPath;

      // Log diagnostics (using rewritten path)
      this.logger.log(`Serving HTML for path: ${req.path}`);
      this.logger.log(`Ingress path detected: ${ingressPath || 'none'}`);

      // Read index.html (fresh read each time to support both Ingress and non-Ingress)
      const indexPath = join(this.staticPath, 'index.html');
      this.logger.log(`Reading index.html from: ${indexPath}`);
      
      if (!existsSync(indexPath)) {
        this.logger.error(`index.html not found at: ${indexPath}`);
        return res.status(404).send('index.html not found');
      }
      
      let html = readFileSync(indexPath, 'utf-8');

      // Inject <base> tag if in Ingress mode
      // Check for !== undefined (not just truthiness) because empty string is valid for Ingress
      if (ingressPath !== undefined) {
        // Inject <base href="./"> for Ingress mode
        // The ./ tells browser to resolve all paths relative to current directory
        // This works because HA preserves the path structure in the browser URL
        const baseTag = `<base href="./">`;
        html = html.replace('<head>', `<head>\n  ${baseTag}`);
        this.logger.log(`✓ Injected base tag for Ingress: ${baseTag}`);
        
        // Remove crossorigin attribute from script tags to avoid CORS issues on same-origin (proxied) requests
        // Vite adds crossorigin by default which can cause issues with Ingress proxies
        html = html.replace(/crossorigin/g, '');
        this.logger.log('✓ Removed crossorigin attributes');
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
