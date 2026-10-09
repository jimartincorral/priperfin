import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { ApiTokenService } from '../api-token.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_API_TOKEN_KEY } from '../decorators/allow-api-token.decorator';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private apiTokenService: ApiTokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check for @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-session-token'];

    if (!token) {
      // A long-lived API token is accepted only where @AllowApiToken() says so.
      const allowsApiToken = this.reflector.getAllAndOverride<boolean>(
        ALLOW_API_TOKEN_KEY,
        [context.getHandler(), context.getClass()],
      );
      const bearer = readBearerToken(request.headers['authorization']);
      if (allowsApiToken && bearer) {
        const profile = await this.apiTokenService.validate(bearer);
        if (!profile) {
          throw new UnauthorizedException('Invalid or revoked API token');
        }
        request.profile = profile;
        request.authKind = 'api-token';
        return true;
      }
      throw new UnauthorizedException('No session token provided');
    }

    const profile = await this.authService.validateSession(token);

    if (!profile) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach profile to request
    request.profile = profile;
    request.authKind = 'session';
    return true;
  }
}

function readBearerToken(header: unknown): string | null {
  if (typeof header !== 'string') return null;
  const match = header.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}
