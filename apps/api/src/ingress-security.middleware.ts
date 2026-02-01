import {
  Injectable,
  NestMiddleware,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IngressSecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IngressSecurityMiddleware.name);
  private readonly INGRESS_IP = '172.30.32.2';

  use(req: Request, res: Response, next: NextFunction) {
    // Get the real client IP (considering potential proxies)
    const clientIp = this.getClientIp(req);

    // Check if request is from Ingress gateway
    if (clientIp === this.INGRESS_IP || this.isLocalhostDevelopment(clientIp)) {
      // Log debug only to reduce noise, but good for troubleshooting connection issues
      // this.logger.debug(`Allowed request from ${clientIp}`);
      next();
    } else {
      this.logger.warn(`Blocked unauthorized request from ${clientIp}`);
      throw new ForbiddenException(
        'Direct access not allowed. Please use Home Assistant Ingress.',
      );
    }
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
