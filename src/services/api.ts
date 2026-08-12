// src/services/api.ts
import config from '../config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem('dosepact_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  put<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  patch<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body, headers });
  }
}

export const api = new ApiClient(config.apiUrl);

// Specific API service methods
export const AuthApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout', {}),
};

export const AlarmApi = {
  getSounds: () => api.get('/alarms/sounds'),
  uploadSound: (formData: FormData) => {
    return fetch(`${config.apiUrl}/alarm/upload-sound`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  setDefault: (soundId: string) => api.put(`/alarm/set-default/${soundId}`, {}),
  deleteSound: (soundId: string) => api.delete(`/alarm/sound/${soundId}`),
  renameSound: (soundId: string, name: string) => api.put(`/alarm/sound/${soundId}/rename`, { name }),
};

export const AccountApi = {
  requestDeletion: (email: string) => api.post('/account/request-deletion', { email }),
  confirmDeletion: (email: string, code: string) => api.post('/account/confirm-deletion', { email, code }),
};

export const PharmacyApi = {
  analyzeInteractions: (data: any) => api.post('/analyze-interactions', data),
  verifyPhoto: (data: any) => api.post('/verify-photo', data),
};