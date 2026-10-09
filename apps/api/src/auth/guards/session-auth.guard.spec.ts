import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionAuthGuard } from './session-auth.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ALLOW_API_TOKEN_KEY } from '../decorators/allow-api-token.decorator';

describe('SessionAuthGuard', () => {
  const authService = { validateSession: jest.fn() };
  const apiTokenService = { validate: jest.fn() };
  const metadata = new Map<string, boolean>();
  const reflector = {
    getAllAndOverride: jest.fn((key: string) => metadata.get(key) ?? false),
  } as unknown as Reflector;
  const guard = new SessionAuthGuard(
    authService as any,
    apiTokenService as any,
    reflector,
  );
  const profile = { id: 'profile-1', name: 'Jose' };

  function context(headers: Record<string, string>) {
    const request: any = { headers };
    return {
      request,
      ctx: {
        switchToHttp: () => ({ getRequest: () => request }),
        getHandler: () => undefined,
        getClass: () => undefined,
      } as unknown as ExecutionContext,
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    metadata.clear();
  });

  it('accepts a session token and marks the request as a session', async () => {
    authService.validateSession.mockResolvedValue(profile);
    const { ctx, request } = context({ 'x-session-token': 'abc' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.profile).toEqual(profile);
    expect(request.authKind).toBe('session');
    expect(apiTokenService.validate).not.toHaveBeenCalled();
  });

  it('accepts a Bearer API token only where @AllowApiToken is set', async () => {
    apiTokenService.validate.mockResolvedValue(profile);
    metadata.set(ALLOW_API_TOKEN_KEY, true);
    const { ctx, request } = context({ authorization: 'Bearer pfp_secret' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(apiTokenService.validate).toHaveBeenCalledWith('pfp_secret');
    expect(request.authKind).toBe('api-token');
  });

  it('ignores a Bearer token on routes that do not allow it', async () => {
    apiTokenService.validate.mockResolvedValue(profile);
    const { ctx } = context({ authorization: 'Bearer pfp_secret' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(apiTokenService.validate).not.toHaveBeenCalled();
  });

  it('rejects an unknown or revoked API token', async () => {
    apiTokenService.validate.mockResolvedValue(null);
    metadata.set(ALLOW_API_TOKEN_KEY, true);
    const { ctx } = context({ authorization: 'Bearer pfp_revoked' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(
      'Invalid or revoked API token',
    );
  });

  it('prefers the session header when both are present', async () => {
    authService.validateSession.mockResolvedValue(profile);
    metadata.set(ALLOW_API_TOKEN_KEY, true);
    const { ctx, request } = context({
      'x-session-token': 'abc',
      authorization: 'Bearer pfp_x',
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.authKind).toBe('session');
    expect(apiTokenService.validate).not.toHaveBeenCalled();
  });

  it('lets @Public routes through without credentials', async () => {
    metadata.set(IS_PUBLIC_KEY, true);
    const { ctx } = context({});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
