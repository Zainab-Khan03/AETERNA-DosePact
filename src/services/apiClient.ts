// src/services/apiClient.ts
import config from '../config';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requiresAuth?: boolean;
}

interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
  accessToken?: string;
  user?: any;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('dosepact_token');
  }

  private getHeaders(options: ApiOptions = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available and required
    if (options.requiresAuth !== false) {
      const token = this.token || localStorage.getItem('dosepact_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options);

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      credentials: 'include', // Important for session cookies
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('dosepact_token');
      localStorage.removeItem('dosepact_user_id');
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json() as ApiResponse<T>;

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }

    return data as T;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('dosepact_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('dosepact_token');
    localStorage.removeItem('dosepact_user_id');
  }

  // API Methods
  async get<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  // Auth specific methods
  async register(data: any): Promise<ApiResponse> {
    const response = await this.post<ApiResponse>('/auth/register', data, { requiresAuth: false });
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.post<ApiResponse>('/auth/login', { email, password }, { requiresAuth: false });
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    await this.post('/auth/logout', {}, { requiresAuth: false });
    this.clearToken();
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.get<ApiResponse>('/auth/me');
  }
}

export const apiClient = new ApiClient(config.apiUrl || 'http://localhost:3000/api');