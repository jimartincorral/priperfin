// Cache the API base URL on first call to prevent it from changing during SPA navigation
let cachedApiBaseUrl: string | null = null;

// Session management
class SessionManager {
    private static readonly TOKEN_KEY = 'session_token';
    private static readonly EXPIRY_KEY = 'session_expiry';

    static saveSession(token: string, expiresAt: string) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.EXPIRY_KEY, expiresAt);
    }

    static clearSession() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.EXPIRY_KEY);
    }

    static isSessionValid(): boolean {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const expiry = localStorage.getItem(this.EXPIRY_KEY);

        if (!token || !expiry) return false;

        const expiryDate = new Date(expiry);
        return expiryDate > new Date();
    }

    static getToken(): string | null {
        return this.isSessionValid() ? localStorage.getItem(this.TOKEN_KEY) : null;
    }

    static hasSession(): boolean {
        return !!this.getToken();
    }
}

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
        const ingressMatch = currentUrl.match(/(.*\/api\/hassio_ingress\/[^\/]+)(?:\/|$)/);
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
    private sessionToken: string | null = null;

    constructor() {
        this.baseUrl = getApiBaseUrl();
        this.sessionToken = SessionManager.getToken();
        console.log('[ApiClient] Base URL:', this.baseUrl);
    }

    setSession(token: string, expiresAt: string) {
        this.sessionToken = token;
        SessionManager.saveSession(token, expiresAt);
    }

    clearSession() {
        this.sessionToken = null;
        SessionManager.clearSession();
    }

    hasSession(): boolean {
        return SessionManager.hasSession();
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {};
        if (this.sessionToken) {
            headers['X-Session-Token'] = this.sessionToken;
        }
        return headers;
    }

    private handleUnauthorized() {
        this.clearSession();
        window.dispatchEvent(new CustomEvent('session-expired'));
    }

    private async parseResponse(response: Response) {
        if (response.status === 401) {
            this.handleUnauthorized();
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }));
            // Handle nested error structure from NestJS validation
            let message = response.statusText;
            if (error.error && error.error.message) {
                // NestJS validation errors
                const messages = Array.isArray(error.error.message) ? error.error.message : [error.error.message];
                message = messages.join(', ');
            } else if (error.message) {
                message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
            } else if (typeof error === 'string') {
                message = error;
            }
            throw new Error(message);
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
            headers: this.getHeaders(),
            credentials: 'same-origin',
        });
        return this.parseResponse(response);
    }

    async post(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'same-origin',
        });
        return this.parseResponse(response);
    }

    async put(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'same-origin',
        });
        return this.parseResponse(response);
    }

    async upload(endpoint: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: formData,
            credentials: 'same-origin',
        });
        return this.parseResponse(response);
    }

    async patch(endpoint: string, data: any) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'same-origin',
        });
        return this.parseResponse(response);
    }

    async delete(endpoint: string, data?: any) {
        const options: RequestInit = {
            method: 'DELETE',
            headers: this.getHeaders(),
            credentials: 'same-origin',
        };
        
        if (data) {
            options.headers = { ...options.headers, 'Content-Type': 'application/json' };
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        return this.parseResponse(response);
    }

    async download(endpoint: string): Promise<Blob> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
            credentials: 'same-origin',
        });
        
        if (response.status === 401) {
            this.handleUnauthorized();
            throw new Error('Session expired. Please log in again.');
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Download failed: ${response.statusText}. ${errorText}`);
        }
        
        return response.blob();
    }
}

export const api = new ApiClient();

// Auth-specific API methods
export const authApi = {
    async getStatus() {
        return api.get('/auth/status');
    },

    async getProfiles() {
        return api.get('/auth/profiles');
    },

    async setup(name: string, pin: string) {
        return api.post('/auth/setup', { name, pin });
    },

    async login(name: string, pin: string) {
        const response = await api.post('/auth/login', { name, pin });
        if (response.token && response.expiresAt) {
            api.setSession(response.token, response.expiresAt);
        }
        return response;
    },

    async logout() {
        try {
            await api.post('/auth/logout', {});
        } finally {
            api.clearSession();
        }
    },

    async getCurrentProfile() {
        return api.get('/auth/me');
    },

    async createProfile(name: string, pin: string) {
        return api.post('/auth/profile', { name, pin });
    },

    async changePin(oldPin: string, newPin: string) {
        const response = await api.post('/auth/change-pin', { oldPin, newPin });
        api.clearSession(); // Force re-login
        return response;
    },
};

// Bank Sync API methods (Enable Banking)
export const bankSyncApi = {
    async getSettings() {
        return api.get('/bank-sync/settings');
    },

    async saveSettings(data: { appId?: string; key?: string; redirectUrl?: string; autoSyncEnabled?: boolean }) {
        return api.post('/bank-sync/settings', data);
    },

    async getBanks(country: string = 'ES') {
        return api.get(`/bank-sync/banks?country=${encodeURIComponent(country)}`);
    },

    async startAuth(data: { aspspName: string; country?: string; redirectUrl?: string }) {
        return api.post('/bank-sync/auth', data);
    },

    async handleCallback(code: string) {
        return api.post('/bank-sync/callback', { code });
    },

    async getConnections() {
        return api.get('/bank-sync/connections');
    },

    async deleteConnection(id: string) {
        return api.delete(`/bank-sync/connections/${id}`);
    },

    async linkAccount(accountId: string, bankAccountUid: string, connectionId: string) {
        return api.post('/bank-sync/link-account', { accountId, bankAccountUid, connectionId });
    },

    async unlinkAccount(accountId: string) {
        return api.post('/bank-sync/unlink-account', { accountId });
    },

    async syncTransactions(accountId?: string) {
        return api.post('/bank-sync/sync', { accountId });
    },
};


