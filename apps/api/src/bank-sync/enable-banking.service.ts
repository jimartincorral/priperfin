import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  Aspsp,
  AuthRequest,
  AuthResponse,
  SessionResponse,
  BankAccountDetails,
  TransactionsResponse,
} from './interfaces/enable-banking.interface';

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

      const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const signInput = `${encodedHeader}.${encodedPayload}`;

      const signer = crypto.createSign('RSA-SHA256');
      signer.update(signInput);
      const signature = signer.sign(privateKeyPem, 'base64url');

      return `${signInput}.${signature}`;
    } catch (error) {
      this.logger.error('Failed to generate RS256 JWT for Enable Banking:', error);
      throw new BadRequestException('Invalid RSA private key or Application ID format');
    }
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE',
    appId: string,
    privateKeyPem: string,
    body?: any,
  ): Promise<T> {
    const token = this.generateJwt(appId, privateKeyPem);
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }
        this.logger.error(
          `Enable Banking API error [${response.status}] ${method} ${endpoint}:`,
          errorBody,
        );
        throw new BadRequestException(
          errorBody?.message || `Enable Banking API returned HTTP ${response.status}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed request to ${method} ${endpoint}:`, error);
      throw new InternalServerErrorException(
        `Failed to communicate with Enable Banking API: ${error.message}`,
      );
    }
  }

  /**
   * List supported ASPSPs (banks) in a given country (e.g. "ES" for Spain)
   */
  async getBanks(country: string, appId: string, privateKeyPem: string): Promise<{ aspsps: Aspsp[] }> {
    const countryCode = (country || 'ES').toUpperCase();
    return this.request<{ aspsps: Aspsp[] }>(
      `/aspsps?country=${encodeURIComponent(countryCode)}`,
      'GET',
      appId,
      privateKeyPem,
    );
  }

  /**
   * Initiates bank authorization flow with Abanca / specified ASPSP
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
  ): Promise<BankAccountDetails> {
    return this.request<BankAccountDetails>(
      `/accounts/${encodeURIComponent(accountUid)}/details`,
      'GET',
      appId,
      privateKeyPem,
    );
  }

  /**
   * Retrieves account balances
   */
  async getAccountBalances(
    accountUid: string,
    appId: string,
    privateKeyPem: string,
  ): Promise<any> {
    return this.request<any>(
      `/accounts/${encodeURIComponent(accountUid)}/balances`,
      'GET',
      appId,
      privateKeyPem,
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
    );
  }
}
