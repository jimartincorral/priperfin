import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApiBaseUrl, ApiClient } from './client';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getApiBaseUrl() Tests
  // ============================================
  describe('getApiBaseUrl', () => {
    it('should return ingress path when in Home Assistant ingress', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          pathname: '/api/hassio_ingress/abc123xyz/expenses',
          hostname: 'homeassistant.local',
        },
        writable: true,
      });

      const result = getApiBaseUrl();

      expect(result).toBe('/api/hassio_ingress/abc123xyz/api');
    });

    it('should return direct port path for development', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          pathname: '/',
          hostname: 'localhost',
        },
        writable: true,
      });

      const result = getApiBaseUrl();

      expect(result).toBe('/api');
    });

    it('should handle various pathname patterns', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          pathname: '/api/hassio_ingress/token_here_123',
          hostname: 'home.local',
        },
        writable: true,
      });

      const result = getApiBaseUrl();

      expect(result).toBe('/api/hassio_ingress/token_here_123/api');
    });

    it('should fall back to direct API for non-ingress paths', () => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          pathname: '/expenses',
          hostname: '192.168.1.100',
        },
        writable: true,
      });

      const result = getApiBaseUrl();

      expect(result).toBe('/api');
    });
  });

  // ============================================
  // ApiClient Class Tests
  // ============================================
  describe('ApiClient', () => {
    let client: ApiClient;

    beforeEach(() => {
      Object.defineProperty(globalThis, 'location', {
        value: {
          pathname: '/',
          hostname: 'localhost',
          origin: 'http://localhost:3000',
        },
        writable: true,
      });

      client = new ApiClient();
    });

    describe('get', () => {
      it('should make GET request with params', async () => {
        const mockResponse = { data: [{ id: 1 }] };
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve(JSON.stringify(mockResponse)),
        } as Response);

        const result = await client.get('/transactions', { month: 1, year: 2025 });

        expect(globalThis.fetch).toHaveBeenCalled();
        const url = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
        expect(url).toContain('/transactions');
        expect(url).toContain('month=1');
        expect(url).toContain('year=2025');
        expect(result).toEqual(mockResponse);
      });

      it('should make GET request without params', async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('[]'),
        } as Response);

        await client.get('/categories');

        expect(globalThis.fetch).toHaveBeenCalled();
      });
    });

    describe('post', () => {
      it('should make POST request with JSON body', async () => {
        const data = { name: 'Test', amount: 100 };
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('{"id": "123"}'),
        } as Response);

        const result = await client.post('/transactions', data);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }),
        );
        expect(result.id).toBe('123');
      });
    });

    describe('put', () => {
      it('should make PUT request with JSON body', async () => {
        const data = { name: 'Updated' };
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('{}'),
        } as Response);

        await client.put('/transactions/123', data);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/123'),
          expect.objectContaining({
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }),
        );
      });
    });

    describe('patch', () => {
      it('should make PATCH request with JSON body', async () => {
        const data = { categoryId: 'cat-1' };
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('{}'),
        } as Response);

        await client.patch('/transactions/123', data);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/123'),
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      });
    });

    describe('delete', () => {
      it('should make DELETE request', async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('{}'),
        } as Response);

        await client.delete('/transactions/123');

        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/123'),
          expect.objectContaining({
            method: 'DELETE',
          }),
        );
      });
    });

    describe('upload', () => {
      it('should make POST request with FormData', async () => {
        const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve('{"count": 5}'),
        } as Response);

        const result = await client.upload('/transactions/import', file);

        expect(globalThis.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/transactions/import'),
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData),
          }),
        );
        expect(result.count).toBe(5);
      });
    });

    describe('error handling', () => {
      it('should throw error on failed response', async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: false,
          statusText: 'Not Found',
          json: () => Promise.resolve({ message: 'Transaction not found' }),
        } as Response);

        await expect(client.get('/transactions/999')).rejects.toThrow(
          'Transaction not found',
        );
      });

      it('should handle response with error object', async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: false,
          statusText: 'Bad Request',
          json: () => Promise.resolve({ error: 'Invalid data' }),
        } as Response);

        await expect(client.post('/transactions', {})).rejects.toThrow();
      });

      it('should handle empty response body', async () => {
        vi.mocked(globalThis.fetch).mockResolvedValue({
          ok: true,
          text: () => Promise.resolve(''),
        } as Response);

        const result = await client.delete('/transactions/123');

        expect(result).toEqual({});
      });
    });
  });
});
