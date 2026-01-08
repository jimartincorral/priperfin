// Helper to get base URL for API calls (handles ingress)
export function getApiBaseUrl(): string {
    const path = window.location.pathname;
    // Check for Home Assistant Ingress paths (both formats)
    // Format 1: /api/hassio_ingress/<token>
    // Format 2: /hassio/ingress/<token>
    const ingressMatch = path.match(/^(\/api\/hassio_ingress\/[^/]+|\/hassio\/ingress\/[^/]+)/);
    if (ingressMatch) {
        // For ingress: use the ingress base path + /api
        // HA ingress proxies requests to the add-on, which has NestJS with global prefix 'api'
        // The ingress strips its own prefix before forwarding to the app
        const baseUrl = `${window.location.origin}${ingressMatch[1]}/api`;
        console.log('[getApiBaseUrl] Ingress detected, base URL:', baseUrl);
        return baseUrl;
    } else {
        // Direct access (development or direct port access)
        // Use relative path to allow Vite proxy or same-origin serving to handle it
        return '/api';
    }
}

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = getApiBaseUrl();
        console.log('[ApiClient] Base URL:', this.baseUrl);
    }

    private async parseResponse(response: Response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(error.message || JSON.stringify(error));
        }
        const text = await response.text();
        try {
            return text ? JSON.parse(text) : {};
        } catch (e) {
            console.error('[ApiClient] JSON Parse Error:', e);
            console.error('[ApiClient] Raw Response Text:', text);
            console.error('[ApiClient] Status:', response.status, response.statusText);
            throw e;
        }
    }

    async get(endpoint: string, params: Record<string, any> = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url.toString());
        return this.parseResponse(response);
    }

    async post(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return this.parseResponse(response);
    }

    async put(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return this.parseResponse(response);
    }

    async upload(endpoint: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            body: formData,
        });
        return this.parseResponse(response);
    }

    async patch(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return this.parseResponse(response);
    }

    async delete(endpoint: string) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
        });
        return this.parseResponse(response);
    }
}

export const api = new ApiClient();
