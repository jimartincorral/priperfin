// Helper to get base URL for API calls (handles ingress)
export function getApiBaseUrl(): string {
    // Robustly determine API URL relative to the application base using document.baseURI
    // Home Assistant Ingress injects a <base href="..."> tag which points to the ingress root.
    // By using the URL constructor relative to baseURI, we automatically handle the ingress path.
    try {
        const base = document.baseURI || window.location.href;
        // Resolve 'api' relative to the base. 
        // If base is .../ingress_token/ (standard HA), result is .../ingress_token/api
        // We ensure we don't accidentally replace the last segment if base doesn't have trailing slash
        // by checking the behavior, but HA Ingress bases always have trailing slash.
        
        // Force trailing slash on base if missing to treat it as a directory
        const safeBase = base.endsWith('/') ? base : base + '/';
        const url = new URL('api', safeBase);
        
        console.log('[getApiBaseUrl] Resolved base URL:', url.href);
        return url.href;
    } catch (e) {
        console.warn('[getApiBaseUrl] Error resolving URL:', e);
        // Fallback for dev/direct access
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
