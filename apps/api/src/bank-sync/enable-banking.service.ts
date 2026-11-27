import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  Aspsp,
  AuthRequest,
  AuthResponse,
  SessionResponse,
  BankAccountDetails,
  TransactionsResponse,
  PsuContext,
  SessionStatusResponse,
} from './interfaces/enable-banking.interface';

/**
 * An error answer from Enable Banking. Still a 400 to our own client, but it
 * keeps the upstream HTTP status and error name so callers can tell an expired
 * or revoked session apart from any other failure.
 */
export class EnableBankingApiError extends BadRequestException {
  constructor(
    message: string,
    readonly upstreamStatus: number,
    readonly errorName?: string,
  ) {
    super(message);
  }
}

/** Builds the `Psu-*` headers for a request a person started. */
export function psuHeaders(psu?: PsuContext): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!psu) return headers;
  const ip = psu.ipAddress?.trim().replace(/^::ffff:/, '');
  if (ip) headers['Psu-Ip-Address'] = ip;
  const ua = psu.userAgent?.trim();
  if (ua) headers['Psu-User-Agent'] = ua.slice(0, 512);
  return headers;
}

@Injectable()
export class EnableBankingService {
  private readonly logger = new Logger(EnableBankingService.name);
  private readonly baseUrl = 'https://api.enablebanking.com';

  /**
   * Generates a signed RS256 JWT token required by Enable Banking API
   */
  generateJwt(appId: string, privateKeyPem: string): string {
    try {
      const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: appId,
      };

      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: 'enablebanking.com',
        aud: 'api.enablebanking.com',
        iat: now,
        exp: now + 3600, // Valid for 1 hour
      };

      const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
        'base64url',
      );
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
        'base64url',
      );
      const signInput = `${encodedHeader}.${encodedPayload}`;

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signInput);
      const signature = signer.sign(privateKeyPem, 'base64url');

      return `${signInput}.${signature}`;
    } catch (error) {
      this.logger.error(
        'Failed to generate RS256 JWT for Enable Banking:',
        error,
      );
      throw new BadRequestException(
        'Invalid RSA private key or Application ID format',
      );
    }
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    appId: string,
    privateKeyPem: string,
    body?: any,
    psu?: PsuContext,
  ): Promise<T> {
    const extra = psuHeaders(psu);
    try {
      return await this.send<T>(
        endpoint,
        method,
        appId,
        privateKeyPem,
        body,
        extra,
      );
    } catch (error) {
      // A bank that rejects the PSU headers themselves (some validate the IP
      // format) should not cost the user a sync: retry once as a background
      // request, which is what every request was before the headers existed.
      if (
        Object.keys(extra).length > 0 &&
        error instanceof EnableBankingApiError &&
        /psu/i.test(`${error.errorName ?? ''} ${error.message}`)
      ) {
        this.logger.warn(
          `Bank rejected the PSU headers on ${method} ${endpoint}; retrying without them`,
        );
        return this.send<T>(endpoint, method, appId, privateKeyPem, body, {});
      }
      throw error;
    }
  }

  private async send<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    appId: string,
    privateKeyPem: string,
    body: any,
    extraHeaders: Record<string, string>,
  ): Promise<T> {
    const token = this.generateJwt(appId, privateKeyPem);
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      this.logger.error(`Failed request to ${method} ${endpoint}:`, error);
      throw new InternalServerErrorException(
        `Failed to communicate with Enable Banking API: ${error.message}`,
      );
    }

    const text = await response.text();
    let parsed: any = undefined;
    try {
      parsed = text ? JSON.parse(text) : undefined;
    } catch {
      parsed = text;
    }

    if (!response.ok) {
      this.logger.error(
        `Enable Banking API error [${response.status}] ${method} ${endpoint}:`,
        parsed,
      );
      const message =
        (typeof parsed === 'object' && parsed?.message) ||
        `Enable Banking API returned HTTP ${response.status}`;
      const errorName =
        typeof parsed === 'object' && typeof parsed?.error === 'string'
          ? parsed.error
          : undefined;
      throw new EnableBankingApiError(
        String(message),
        response.status,
        errorName,
      );
    }

    return parsed as T;
  }

  /**
   * List supported ASPSPs (banks) in a given country (e.g. "ES" for Spain)
   */
  async getBanks(
    country: string,
    appId: string,
    privateKeyPem: string,
  ): Promise<{ aspsps: Aspsp[] }> {
    const countryCode = (country || 'ES').toUpperCase();
    return this.request<{ aspsps: Aspsp[] }>(
      `/aspsps?country=${encodeURIComponent(countryCode)}`,
      'GET',
      appId,
      privateKeyPem,
    );
  }

  /**
   * Initiates the bank authorization flow for the given ASPSP
   */
  async startAuth(
    request: AuthRequest,
    appId: string,
    privateKeyPem: string,
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      '/auth',
      'POST',
      appId,
      privateKeyPem,
      request,
    );
  }

  /**
   * Exchanges callback authorization code for a session and authorized account UIDs
   */
  async createSession(
    code: string,
    appId: string,
    privateKeyPem: string,
  ): Promise<SessionResponse> {
    return this.request<SessionResponse>(
      '/sessions',
      'POST',
      appId,
      privateKeyPem,
      { code },
    );
  }

  /**
   * Retrieves bank account details (IBAN, currency, balances, account name)
   */
  async getAccountDetails(
    accountUid: string,
    appId: string,
    privateKeyPem: string,
    psu?: PsuContext,
  ): Promise<BankAccountDetails> {
    return this.request<BankAccountDetails>(
      `/accounts/${encodeURIComponent(accountUid)}/details`,
      'GET',
      appId,
      privateKeyPem,
      undefined,
      psu,
    );
  }

  /**
   * Retrieves account balances
   */
  async getAccountBalances(
    accountUid: string,
    appId: string,
    privateKeyPem: string,
    psu?: PsuContext,
  ): Promise<any> {
    return this.request<any>(
      `/accounts/${encodeURIComponent(accountUid)}/balances`,
      'GET',
      appId,
      privateKeyPem,
      undefined,
      psu,
    );
  }

  /**
   * Retrieves transaction history for an account UID
   */
  async getAccountTransactions(
    accountUid: string,
    appId: string,
    privateKeyPem: string,
    dateFrom?: string,
    dateTo?: string,
    continuationKey?: string,
    psu?: PsuContext,
  ): Promise<TransactionsResponse> {
    const params = new URLSearchParams();
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    if (continuationKey) params.set('continuation_key', continuationKey);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request<TransactionsResponse>(
      `/accounts/${encodeURIComponent(accountUid)}/transactions${qs}`,
      'GET',
      appId,
      privateKeyPem,
      undefined,
      psu,
    );
  }

  /**
   * Session state at Enable Banking (AUTHORIZED, EXPIRED, REVOKED, ...).
   * Reads Enable Banking's own record, not the bank, so it costs no bank access.
   */
  async getSession(
    sessionId: string,
    appId: string,
    privateKeyPem: string,
  ): Promise<SessionStatusResponse> {
    return this.request<SessionStatusResponse>(
      `/sessions/${encodeURIComponent(sessionId)}`,
      'GET',
      appId,
      privateKeyPem,
    );
  }

  /** Ends the session, which withdraws the consent given at the bank. */
  async deleteSession(
    sessionId: string,
    appId: string,
    privateKeyPem: string,
  ): Promise<void> {
    await this.request<unknown>(
      `/sessions/${encodeURIComponent(sessionId)}`,
      'DELETE',
      appId,
      privateKeyPem,
    );
  }
}
