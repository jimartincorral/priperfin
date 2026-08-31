import { Test, TestingModule } from '@nestjs/testing';
import { EnableBankingService } from './enable-banking.service';
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
      const isValid = verify.verify(testKeyPair.publicKey, parts[2], 'base64url');
      expect(isValid).toBe(true);
    });

    it('should throw BadRequestException on invalid private key format', () => {
      expect(() => {
        service.generateJwt('test-app', 'not-a-valid-pem-key');
      }).toThrow();
    });
  });
});
