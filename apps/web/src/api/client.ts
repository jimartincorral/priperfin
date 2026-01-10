// Cache the API base URL on first call to prevent it from changing during SPA navigation
let cachedApiBaseUrl: string | null = null;

// Helper to get base URL for API calls (handles ingress)
export function getApiBaseUrl(): string {
    // Return cached URL if available
    if (cachedApiBaseUrl) {
        console.log('[getApiBaseUrl] Using cached URL:', cachedApiBaseUrl);
        return cachedApiBaseUrl;
    }

    // Robustly determine API URL relative to the application base using document.baseURI
    // Home Assistant Ingress injects a <base href="..."> tag which points to the ingress root.
    // By using the URL constructor relative to baseURI, we automatically handle the ingress path.
    try {
        // Use window.location.href as the starting point instead of document.baseURI
        // This is because document.baseURI can change during SPA navigation
        const currentUrl = window.location.href;
        console.log('[getApiBaseUrl] Current URL:', currentUrl);
        
        // Check if we're in Home Assistant Ingress (URL contains /api/hassio_ingress/)
        const ingressMatch = currentUrl.match(/(.*\/api\/hassio_ingress\/[^\/]+)\//);
        if (ingressMatch) {
            // We're in HA Ingress - use the ingress path
            const ingressBase = ingressMatch[1];
            cachedApiBaseUrl = `${ingressBase}/api`;
            console.log('[getApiBaseUrl] Detected HA Ingress, resolved base URL:', cachedApiBaseUrl);
            return cachedApiBaseUrl;
        }
        
        // Not in Ingress - use standard relative path
        // Get the origin (protocol + host + port)
        const origin = window.location.origin;
        cachedApiBaseUrl = `${origin}/api`;
        console.log('[getApiBaseUrl] Standard mode, resolved base URL:', cachedApiBaseUrl);
        return cachedApiBaseUrl;
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

        const response = await fetch(url.toString(), {
            credentials: 'same-origin', // Ensure cookies/session are included for HA Ingress
        });
        return this.parseResponse(response);
    }

    async post(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'same-origin', // Ensure cookies/session are included for HA Ingress
        });
        return this.parseResponse(response);
    }

    async put(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'same-origin', // Ensure cookies/session are included for HA Ingress
        });
        return this.parseResponse(response);
    }

    async upload(endpoint: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin', // Ensure cookies/session are included for HA Ingress
        });
        return this.parseResponse(response);
    }

    async patch(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'same-origin', // Ensure cookies/session are included for HA Ingress
        });
        return this.parseResponse(response);
    }

    async delete(endpoint: string) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            credentials: 'same-origin', // Ensure cookies/session are included for HA Ingress
        });
        return this.parseResponse(response);
    }
}

export const api = new ApiClient();
