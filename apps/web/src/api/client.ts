// Helper to get base URL for API calls (handles ingress)
export function getApiBaseUrl(): string {
    const path = window.location.pathname;
    if (path.includes('/api/hassio_ingress/')) {
        // Extract the ingress base path and use relative API calls
        const ingressMatch = path.match(/^(\/api\/hassio_ingress\/[^/]+)/);
        return ingressMatch ? `${ingressMatch[1]}/api` : '/api';
    } else {
        // Direct access (development or direct port access)
        return `http://${window.location.hostname}:3000/api`;
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
        return text ? JSON.parse(text) : {};
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
