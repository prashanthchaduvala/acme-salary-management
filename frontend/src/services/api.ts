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
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = JSON.stringify(errJson);
    } catch {
      errorDetail = `Status: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
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
    return `${API_BASE}/employees/export-csv/${qs}`;
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
