import { beforeEach, describe, expect, it, vi } from 'vitest';

type ClientModule = typeof import('./client');

function setLocation(href: string) {
  const url = new URL(href);

  Object.defineProperty(globalThis, 'location', {
    value: {
      hostname: url.hostname,
      pathname: url.pathname,
      href: url.href,
      origin: url.origin,
    },
    writable: true,
  });
}

async function loadClientModule(): Promise<ClientModule> {
  vi.resetModules();
  return import('./client');
}

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setLocation('http://localhost:3000/');
  });

  describe('getApiBaseUrl', () => {
    it('should return ingress path when in Home Assistant ingress', async () => {
      setLocation('http://homeassistant.local/api/hassio_ingress/abc123xyz/expenses');
      const { getApiBaseUrl } = await loadClientModule();

      expect(getApiBaseUrl()).toBe(
        'http://homeassistant.local/api/hassio_ingress/abc123xyz/api',
      );
    });

    it('should return direct port path for development', async () => {
      const { getApiBaseUrl } = await loadClientModule();

      expect(getApiBaseUrl()).toBe('http://localhost:3000/api');
    });

    it('should handle ingress root paths without a trailing slash', async () => {
      setLocation('http://home.local/api/hassio_ingress/token_here_123');
      const { getApiBaseUrl } = await loadClientModule();

      expect(getApiBaseUrl()).toBe(
        'http://home.local/api/hassio_ingress/token_here_123/api',
      );
    });

    it('should fall back to direct API for non-ingress paths', async () => {
      setLocation('http://192.168.1.100/expenses');
      const { getApiBaseUrl } = await loadClientModule();

      expect(getApiBaseUrl()).toBe('http://192.168.1.100/api');
    });
  });

  describe('ApiClient', () => {
    let client: InstanceType<ClientModule['ApiClient']>;
    let ApiClientClass: ClientModule['ApiClient'];

    beforeEach(async () => {
      setLocation('http://localhost:3000/');
      const module = await loadClientModule();
      ApiClientClass = module.ApiClient;
      client = new ApiClientClass();
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
