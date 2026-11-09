export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  is_hr?: boolean;
  employee_record?: {
    employee_id: string;
    job_title: string;
    department: string;
    country: string;
    city: string;
    currency: string;
    base_salary: number;
    bonus_percentage: number;
    net_annual_salary: number;
  } | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SalaryStructure {
  id?: number;
  base_salary: string | number;
  bonus_percentage: string | number;
  housing_allowance: string | number;
  transport_allowance: string | number;
  other_allowance: string | number;
  tax_deduction_rate: string | number;
  retirement_contribution: string | number;
  net_annual_salary: string | number;
  bonus_amount?: string | number;
  total_allowances?: string | number;
  gross_annual_salary?: string | number;
  tax_deduction_amount?: string | number;
  retirement_amount?: string | number;
  effective_from: string;
  updated_at?: string;
}

export interface SalaryRevisionHistory {
  id: number;
  employee: number;
  previous_base: string | number;
  new_base: string | number;
  percentage_change: string | number;
  currency: string;
  effective_date: string;
  reason: string;
  approved_by: string;
  created_at: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  department: string;
  job_title: string;
  country: string;
  city: string;
  currency: string;
  gender: string;
  hire_date: string;
  employment_status: string;
  base_salary: string | number;
  bonus_percentage: string | number;
  net_annual_salary: string | number;
  base_salary_usd: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeDetail extends Employee {
  salary_structure: SalaryStructure;
  revisions: SalaryRevisionHistory[];
}

export interface AnalyticsSummary {
  headcount: number;
  total_spend_usd: number;
  avg_salary_usd: number;
  median_salary_usd: number;
  min_salary_usd: number;
  max_salary_usd: number;
}

export interface DepartmentMetric {
  department: string;
  headcount: number;
  total_spend_usd: number;
  avg_salary_usd: number;
  min_salary_usd: number;
  max_salary_usd: number;
  spend_percentage: number;
}

export interface GeoMetric {
  country: string;
  currency: string;
  headcount: number;
  total_spend_usd: number;
  avg_salary_usd: number;
}

export interface PayParityData {
  gender_distribution: Record<string, {
    headcount: number;
    avg_salary_usd: number;
    total_spend_usd: number;
  }>;
  female_to_male_ratio_pct: number;
  salary_bands: Array<{
    band: string;
    headcount: number;
  }>;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate_to_usd: string | number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FilterParams {
  department?: string;
  country?: string;
  currency?: string;
  gender?: string;
  employment_status?: string;
  min_salary?: string | number;
  max_salary?: string | number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
