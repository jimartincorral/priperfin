import { ForbiddenException } from '@nestjs/common';
import {
  IngressSecurityMiddleware,
  getHaUser,
} from './ingress-security.middleware';

function request(
  remoteAddress: string,
  url: string,
  headers: Record<string, string> = {},
) {
  return { socket: { remoteAddress }, originalUrl: url, url, headers } as any;
}

describe('IngressSecurityMiddleware', () => {
  const originalEnv = process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS;
  afterEach(() => {
    if (originalEnv === undefined)
      delete process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS;
    else process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS = originalEnv;
  });

  function run(req: any) {
    const middleware = new IngressSecurityMiddleware();
    const next = jest.fn();
    middleware.use(req, {} as any, next);
    return next;
  }

  it('allows the Ingress gateway and attaches the Home Assistant user', () => {
    delete process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS;
    const req = request('::ffff:172.30.32.2', '/api/auth/status', {
      'x-remote-user-id': 'u1',
      'x-remote-user-name': 'jose',
      'x-remote-user-display-name': 'Jose',
    });
    expect(run(req)).toHaveBeenCalled();
    expect(getHaUser(req)).toEqual({
      id: 'u1',
      name: 'jose',
      displayName: 'Jose',
    });
  });

  it('never trusts the user headers from any other peer', () => {
    delete process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS;
    const req = request('127.0.0.1', '/api/auth/status', {
      'x-remote-user-id': 'u1',
    });
    expect(run(req)).toHaveBeenCalled();
    expect(getHaUser(req)).toBeNull();
  });

  it('never trusts the user headers when direct access is on', () => {
    process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS = 'true';
    const req = request('172.30.32.2', '/api/auth/status', {
      'x-remote-user-id': 'u1',
    });
    expect(run(req)).toHaveBeenCalled();
    expect(getHaUser(req)).toBeNull();
  });

  it('lets any peer reach /api/ha/* (the token is the credential there)', () => {
    delete process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS;
    expect(
      run(request('172.30.32.1', '/api/ha/summary?x=1')),
    ).toHaveBeenCalled();
    expect(run(request('192.168.1.20', '/api//ha/summary'))).toHaveBeenCalled();
  });

  it('still blocks other routes from the network', () => {
    delete process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS;
    expect(() => run(request('172.30.32.1', '/api/transactions'))).toThrow(
      ForbiddenException,
    );
    expect(() => run(request('192.168.1.20', '/api/hazard'))).toThrow(
      ForbiddenException,
    );
  });
});
