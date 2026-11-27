import { Test, TestingModule } from '@nestjs/testing';
import {
  EnableBankingService,
  EnableBankingApiError,
  psuHeaders,
} from './enable-banking.service';
import * as crypto from 'crypto';

describe('EnableBankingService', () => {
  let service: EnableBankingService;
  let testKeyPair: { publicKey: string; privateKey: string };

  beforeAll(() => {
    // Generate an RSA key pair for testing
    testKeyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnableBankingService],
    }).compile();

    service = module.get<EnableBankingService>(EnableBankingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateJwt', () => {
    it('should generate a valid 3-part RS256 JWT with correct kid header', () => {
      const appId = 'test-app-id-123';
      const jwt = service.generateJwt(appId, testKeyPair.privateKey);

      expect(jwt).toBeDefined();
      const parts = jwt.split('.');
      expect(parts.length).toBe(3);

      const headerJson = Buffer.from(parts[0], 'base64url').toString('utf8');
      const header = JSON.parse(headerJson);
      expect(header.alg).toBe('RS256');
      expect(header.typ).toBe('JWT');
      expect(header.kid).toBe(appId);

      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);
      expect(payload.iss).toBe('enablebanking.com');
      expect(payload.aud).toBe('api.enablebanking.com');
      expect(payload.exp).toBeGreaterThan(payload.iat);

      // Verify signature with public key
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(`${parts[0]}.${parts[1]}`);
      const isValid = verify.verify(
        testKeyPair.publicKey,
        parts[2],
        'base64url',
      );
      expect(isValid).toBe(true);
    });

    it('should throw BadRequestException on invalid private key format', () => {
      expect(() => {
        service.generateJwt('test-app', 'not-a-valid-pem-key');
      }).toThrow();
    });
  });

  describe('psuHeaders', () => {
    it('sends nothing for a background request', () => {
      expect(psuHeaders(undefined)).toEqual({});
      expect(psuHeaders({})).toEqual({});
    });

    it('unwraps IPv4-mapped addresses', () => {
      expect(
        psuHeaders({ ipAddress: '::ffff:192.0.2.4', userAgent: 'Safari' }),
      ).toEqual({ 'Psu-Ip-Address': '192.0.2.4', 'Psu-User-Agent': 'Safari' });
    });
  });

  describe('requests', () => {
    const realFetch = global.fetch;
    let fetchMock: jest.Mock;

    beforeEach(() => {
      fetchMock = jest.fn();
      global.fetch = fetchMock as any;
    });
    afterEach(() => {
      global.fetch = realFetch;
    });

    const reply = (status: number, body: unknown) => ({
      ok: status >= 200 && status < 300,
      status,
      text: () =>
        Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
    });

    it('sends the PSU headers on a user-started request', async () => {
      fetchMock.mockResolvedValue(reply(200, { transactions: [] }));
      await service.getAccountTransactions(
        'uid',
        'app',
        testKeyPair.privateKey,
        '2026-11-01',
        undefined,
        undefined,
        { ipAddress: '203.0.113.7', userAgent: 'Firefox' },
      );
      const headers = fetchMock.mock.calls[0][1].headers;
      expect(headers['Psu-Ip-Address']).toBe('203.0.113.7');
      expect(headers['Psu-User-Agent']).toBe('Firefox');
    });

    it('retries without PSU headers when the bank rejects them', async () => {
      fetchMock
        .mockResolvedValueOnce(
          reply(422, { message: 'Invalid PSU IP address', error: 'X' }),
        )
        .mockResolvedValueOnce(reply(200, { transactions: [] }));
      await service.getAccountTransactions(
        'uid',
        'app',
        testKeyPair.privateKey,
        undefined,
        undefined,
        undefined,
        { ipAddress: '10.0.0.2' },
      );
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][1].headers['Psu-Ip-Address']).toBe(
        undefined,
      );
    });

    it('keeps the upstream status on errors and does not retry others', async () => {
      fetchMock.mockResolvedValue(
        reply(401, { message: 'Session expired', error: 'EXPIRED_SESSION' }),
      );
      const call = service.getAccountTransactions(
        'uid',
        'app',
        testKeyPair.privateKey,
        undefined,
        undefined,
        undefined,
        { ipAddress: '203.0.113.7' },
      );
      await expect(call).rejects.toBeInstanceOf(EnableBankingApiError);
      await expect(call).rejects.toMatchObject({
        upstreamStatus: 401,
        errorName: 'EXPIRED_SESSION',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('accepts an empty body, as DELETE /sessions returns', async () => {
      fetchMock.mockResolvedValue(reply(200, undefined));
      await expect(
        service.deleteSession('s-1', 'app', testKeyPair.privateKey),
      ).resolves.toBeUndefined();
      expect(fetchMock.mock.calls[0][0]).toBe(
        'https://api.enablebanking.com/sessions/s-1',
      );
      expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    });
  });
});
