import {
  Employee,
  EmployeeDetail,
  PaginatedResponse,
  FilterParams,
  AnalyticsSummary,
  DepartmentMetric,
  GeoMetric,
  PayParityData,
  CurrencyRate,
  User,
  AuthResponse,
} from '../types';

export function getApiBase(): string {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('acme_api_url') : null;
  const raw = (custom || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').trim().replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

export function setCustomApiUrl(url: string): string {
  const clean = url.trim().replace(/\/+$/, '');
  const finalUrl = clean.endsWith('/api') ? clean : `${clean}/api`;
  if (typeof window !== 'undefined') {
    localStorage.setItem('acme_api_url', finalUrl);
  }
  return finalUrl;
}

export const API_BASE = getApiBase();

function getAuthToken(): string | null {
  return localStorage.getItem('acme_auth_token');
}

function buildQueryString(params?: FilterParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'all') {
      searchParams.append(key, String(val));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const base = getApiBase();
  const url = `${base}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Stale token cleanup and notification
    if (response.status === 401) {
      localStorage.removeItem('acme_auth_token');
      localStorage.removeItem('acme_auth_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acme_unauthorized'));
      }
    }

    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      if (typeof errJson === 'object' && errJson !== null) {
        const msgs = Object.entries(errJson)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        errorDetail = msgs || JSON.stringify(errJson);
      } else {
        errorDetail = String(errJson);
      }
    } catch {
      errorDetail = `Status: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Authentication endpoints
  async login(data: { username: string; password: string }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('acme_auth_token', res.token);
      localStorage.setItem('acme_auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  async register(data: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    department?: string;
  }): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      localStorage.setItem('acme_auth_token', res.token);
      localStorage.setItem('acme_auth_user', JSON.stringify(res.user));
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout/', { method: 'POST' });
    } finally {
      localStorage.removeItem('acme_auth_token');
      localStorage.removeItem('acme_auth_user');
    }
  },

  async getMe(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    return request<{ isAuthenticated: boolean; user: User | null }>('/auth/me/');
  },

  // Employee endpoints
  async getEmployees(params?: FilterParams): Promise<PaginatedResponse<Employee>> {
    const qs = buildQueryString(params);
    return request<PaginatedResponse<Employee>>(`/employees/${qs}`);
  },

  async getEmployee(id: number): Promise<EmployeeDetail> {
    return request<EmployeeDetail>(`/employees/${id}/`);
  },

  async createEmployee(data: any): Promise<Employee> {
    return request<Employee>('/employees/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async reviseSalary(id: number, data: {
    new_base_salary: number | string;
    reason: string;
    approved_by?: string;
    bonus_percentage?: number | string;
  }): Promise<{ message: string; employee: EmployeeDetail; revision: any }> {
    return request<{ message: string; employee: EmployeeDetail; revision: any }>(
      `/employees/${id}/revise-salary/`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  getExportCsvUrl(params?: FilterParams): string {
    const qs = buildQueryString(params);
    return `${getApiBase()}/employees/export-csv/${qs}`;
  },

  // Analytics endpoints
  async getAnalyticsSummary(params?: FilterParams): Promise<AnalyticsSummary> {
    const qs = buildQueryString(params);
    return request<AnalyticsSummary>(`/analytics/summary/${qs}`);
  },

  async getDepartmentAnalytics(params?: FilterParams): Promise<DepartmentMetric[]> {
    const qs = buildQueryString(params);
    return request<DepartmentMetric[]>(`/analytics/departments/${qs}`);
  },

  async getGeoAnalytics(params?: FilterParams): Promise<GeoMetric[]> {
    const qs = buildQueryString(params);
    return request<GeoMetric[]>(`/analytics/geo/${qs}`);
  },

  async getPayParity(params?: FilterParams): Promise<PayParityData> {
    const qs = buildQueryString(params);
    return request<PayParityData>(`/analytics/pay-parity/${qs}`);
  },

  async getCurrencies(): Promise<CurrencyRate[]> {
    return request<CurrencyRate[]>('/currencies/');
  },

  async getHealth(): Promise<{ status: string; total_employees: number }> {
    return request<{ status: string; total_employees: number }>('/health/');
  },
};
