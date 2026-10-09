import {
  Injectable,
  NestMiddleware,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/** The Home Assistant user behind an Ingress request, from Supervisor headers. */
export interface HaUser {
  id: string;
  name: string | null;
  displayName: string | null;
}

/** Reads the HA user the middleware attached, if the request came via Ingress. */
export function getHaUser(req: Request): HaUser | null {
  return (req as Request & { haUser?: HaUser }).haUser ?? null;
}

@Injectable()
export class IngressSecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressSecurityMiddleware.name);
  private readonly INGRESS_IP = '172.30.32.2';

  /**
   * Standalone container mode (docker compose, no Home Assistant). The
   * browser's connection then arrives from the Docker bridge gateway, never
   * from loopback or the Ingress gateway, so the allow-list below would reject
   * every request. run.sh sets this when no Supervisor options file exists;
   * docker-compose.yml keeps the published port bound to the host's loopback
   * so the app still is not reachable from the network by default.
   */
  private readonly allowDirectAccess =
    process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS === 'true';

  use(req: Request, res: Response, next: NextFunction) {
    if (this.allowDirectAccess) {
      // Headers are not trustworthy outside Ingress: never attach an HA user.
      next();
      return;
    }

    // Get the real client IP (considering potential proxies)
    const clientIp = this.getClientIp(req);
    const fromIngress = clientIp === this.INGRESS_IP;

    if (fromIngress) {
      // Supervisor sets these on every Ingress request and strips any copies
      // the client sent, so from the gateway they identify the HA user.
      const haUser = this.readHaUser(req);
      if (haUser) (req as Request & { haUser?: HaUser }).haUser = haUser;
    }

    // Check if request is from Ingress gateway
    if (
      fromIngress ||
      this.isLocalhostDevelopment(clientIp) ||
      this.isHomeAssistantApiPath(req)
    ) {
      next();
    } else {
      this.logger.warn(`Blocked unauthorized request from ${clientIp}`);
      throw new ForbiddenException(
        'Direct access not allowed. Please use Home Assistant Ingress.',
      );
    }
  }

  /**
   * The Home Assistant integration polls /api/ha/* from HA Core on the
   * add-on network, not through Ingress. Those routes are reachable from any
   * peer; the auth guard's API token (or session) is the credential there.
   */
  private isHomeAssistantApiPath(req: Request): boolean {
    const path = (req.originalUrl || req.url || '')
      .split('?')[0]
      .replace(/\/+/g, '/');
    return path === '/api/ha' || path.startsWith('/api/ha/');
  }

  private readHaUser(req: Request): HaUser | null {
    const id = this.headerString(req, 'x-remote-user-id');
    if (!id) return null;
    return {
      id,
      name: this.headerString(req, 'x-remote-user-name'),
      displayName: this.headerString(req, 'x-remote-user-display-name'),
    };
  }

  private headerString(req: Request, name: string): string | null {
    const value = req.headers[name];
    const first = Array.isArray(value) ? value[0] : value;
    return typeof first === 'string' && first.trim() ? first.trim() : null;
  }

  private getClientIp(req: Request): string {
    // SECURITY CRITICAL: We must check the direct socket connection IP,
    // NOT the X-Forwarded-For header.
    // X-Forwarded-For contains the *original user's IP* (e.g. 192.168.1.50),
    // but we want to verify the request is coming from the Ingress Proxy (172.30.32.2).

    // Fall back to socket remote address
    const socketAddress = req.socket.remoteAddress;

    // Handle IPv6-mapped IPv4 addresses (::ffff:172.30.32.2 -> 172.30.32.2)
    if (socketAddress?.startsWith('::ffff:')) {
      return socketAddress.substring(7);
    }

    return socketAddress || 'unknown';
  }

  private isLocalhostDevelopment(ip: string): boolean {
    // Allow localhost for development
    return (
      ip === '127.0.0.1' ||
      ip === 'localhost' ||
      ip === '::1' ||
      ip === '::ffff:127.0.0.1'
    );
  }
}
