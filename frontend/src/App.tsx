import React, { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { KPIHeader } from './components/KPIHeader';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { FilterToolbar } from './components/FilterToolbar';
import { EmployeeTable } from './components/EmployeeTable';
import { ReviseSalaryModal } from './components/ReviseSalaryModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { AuthPage } from './components/AuthPage';
import { Toast, ToastProps } from './components/Toast';
import { api } from './services/api';
import {
  Employee,
  EmployeeDetail,
  FilterParams,
  AnalyticsSummary,
  DepartmentMetric,
  GeoMetric,
  PayParityData,
  CurrencyRate,
  User,
} from './types';

export const App: React.FC = () => {
  // Navigation & Display State
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'parity'>('overview');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);

  // Auth State — Initialized synchronously from localStorage on page load/refresh
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('acme_auth_user');
      const token = localStorage.getItem('acme_auth_token');
      if (stored && token) {
        return JSON.parse(stored);
      }
      return null;
    } catch {
      return null;
    }
  });

  // Filter & Pagination State
  const [filters, setFilters] = useState<FilterParams>({
    department: 'All',
    country: 'All',
    currency: 'All',
    gender: 'All',
    employment_status: 'All',
    search: '',
    ordering: '-hire_date',
    page: 1,
    page_size: 25,
  });

  // Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState<number>(10000);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const [geography, setGeography] = useState<GeoMetric[]>([]);
  const [parity, setParity] = useState<PayParityData | null>(null);

  // Loading & Action States
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [toast, setToast] = useState<Omit<ToastProps, 'onClose'> | null>(null);

  // Modal Dialogs
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Listen for 401 Unauthorized events from API
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToast({ type: 'error', message: 'Your session has expired. Please sign in again.' });
    };
    window.addEventListener('acme_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('acme_unauthorized', handleUnauthorized);
  }, []);

  // 1. Initial Load: Currencies & verify backend session on refresh
  useEffect(() => {
    api.getCurrencies()
      .then((data) => setCurrencies(data))
      .catch((err) => console.error('Failed to load currencies:', err));

    const token = localStorage.getItem('acme_auth_token');
    if (token) {
      api.getMe()
        .then((res) => {
          if (res.isAuthenticated && res.user) {
            setUser(res.user);
            localStorage.setItem('acme_auth_user', JSON.stringify(res.user));
          } else {
            // Token was purged or invalidated on backend
            setUser(null);
            localStorage.removeItem('acme_auth_token');
            localStorage.removeItem('acme_auth_user');
          }
        })
        .catch(() => {
          // Keep local session if backend temporarily unreachable
        });
    }
  }, []);

  // 2. Fetch Employee Table Data (when user authenticated)
  const fetchEmployees = useCallback(() => {
    setLoadingList(true);
    api.getEmployees(filters)
      .then((res) => {
        setEmployees(res.results);
        setTotalCount(res.count);
      })
      .catch((err) => {
        console.error('Failed to fetch employees:', err);
        setToast({ type: 'error', message: 'Could not load employee records. Check server connection.' });
      })
      .finally(() => setLoadingList(false));
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [fetchEmployees, user]);

  // 3. Fetch Executive Analytics (when user authenticated)
  const fetchAnalytics = useCallback(() => {
    setLoadingAnalytics(true);
    Promise.all([
      api.getAnalyticsSummary(filters),
      api.getDepartmentAnalytics(filters),
      api.getGeoAnalytics(filters),
      api.getPayParity(filters),
    ])
      .then(([summaryData, deptData, geoData, parityData]) => {
        setSummary(summaryData);
        setDepartments(deptData);
        setGeography(geoData);
        setParity(parityData);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
      })
      .finally(() => setLoadingAnalytics(false));
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, user]);

  // Handlers for Filters & Pagination
  const handleFilterChange = (newFilters: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      department: 'All',
      country: 'All',
      currency: 'All',
      gender: 'All',
      employment_status: 'All',
      search: '',
      ordering: '-hire_date',
      page: 1,
      page_size: 25,
    });
    setToast({ type: 'info', message: 'Filters reset to entire 10,000 employee organization.' });
  };

  const handleExportCsv = () => {
    setExporting(true);
    const exportUrl = api.getExportCsvUrl(filters);
    window.location.href = exportUrl;
    setTimeout(() => {
      setExporting(false);
      setToast({ type: 'success', message: 'Payroll CSV export generated successfully.' });
    }, 1200);
  };

  const handleSalaryRevisionSuccess = (updatedEmployee: EmployeeDetail) => {
    setToast({
      type: 'success',
      message: `Salary for ${updatedEmployee.full_name} (${updatedEmployee.employee_id}) revised to ${updatedEmployee.salary_structure.base_salary} ${updatedEmployee.currency}!`,
    });
    fetchEmployees();
    fetchAnalytics();
  };

  const handleAddEmployeeSuccess = (newEmployee: Employee) => {
    setToast({
      type: 'success',
      message: `Employee ${newEmployee.full_name} (${newEmployee.employee_id}) onboarded successfully!`,
    });
    fetchEmployees();
    fetchAnalytics();
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    localStorage.setItem('acme_auth_user', JSON.stringify(authenticatedUser));
    setToast({
      type: 'success',
      message: `Welcome, ${authenticatedUser.first_name || authenticatedUser.username}! Signed in as ${authenticatedUser.role || 'HR Lead'}.`,
    });
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Backend logout call failed, clearing local session anyway:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('acme_auth_token');
      localStorage.removeItem('acme_auth_user');
      setToast({ type: 'info', message: 'You have been signed out successfully.' });
    }
  };

  // If unauthenticated: Route directly to full-page Login & Registration
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900">
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
        <AuthPage onSuccess={handleAuthSuccess} />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / (filters.page_size || 25));

  const isHR = user
    ? user.is_hr !== false &&
      !user.role?.toLowerCase().includes('employee') &&
      !user.role?.toLowerCase().includes('staff')
    : true;

  const isFiltered = Boolean(
    (filters.department && filters.department !== 'All') ||
    (filters.country && filters.country !== 'All') ||
    (filters.currency && filters.currency !== 'All') ||
    (filters.gender && filters.gender !== 'All') ||
    (filters.employment_status && filters.employment_status !== 'All') ||
    filters.search
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Navigation */}
      <Navbar
        totalHeadcount={summary?.headcount ?? totalCount}
        currencies={currencies}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={setSelectedCurrency}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuthModal={() => {}}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Employee Read-Only Notification Banner */}
        {!isHR && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Standard Employee Access Mode (Read-Only)</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Self-Service Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  You are authenticated as <strong>{user?.first_name} {user?.last_name}</strong> ({user?.role}). You have read-only access to browse the staff directory. Modifying employee compensation and onboarding new hires are strictly reserved for HR Administrators.
                </p>
              </div>
            </div>
            {user?.employee_record && (
              <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shrink-0">
                <div className="text-left text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">My Base Salary</span>
                  <span className="font-extrabold text-slate-900">
                    {user.employee_record.base_salary.toLocaleString()} {user.employee_record.currency}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-left text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Bonus</span>
                  <span className="font-extrabold text-indigo-600">
                    {user.employee_record.bonus_percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {/* KPI Strip */}
        <KPIHeader
          summary={summary}
          loading={loadingAnalytics}
          selectedCurrency={selectedCurrency}
          currencies={currencies}
          isFiltered={isFiltered}
        />

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AnalyticsCharts
              departments={departments}
              geography={geography}
              parity={parity}
              loading={loadingAnalytics}
              selectedCurrency={selectedCurrency}
              onFilterDepartment={(dept) => {
                handleFilterChange({ department: dept, page: 1 });
                setActiveTab('employees');
              }}
              onFilterCountry={(country) => {
                handleFilterChange({ country, page: 1 });
                setActiveTab('employees');
              }}
            />

            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Recent Compensation Roster</h3>
                  <p className="text-xs text-slate-500">Fast preview of staff directory</p>
                </div>
                <button
                  onClick={() => setActiveTab('employees')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                >
                  View full registry →
                </button>
              </div>

              <EmployeeTable
                employees={employees.slice(0, 10)}
                totalCount={totalCount}
                currentPage={filters.page || 1}
                pageSize={filters.page_size || 25}
                totalPages={totalPages}
                loading={loadingList}
                ordering={filters.ordering}
                onPageChange={(page) => handleFilterChange({ page })}
                onPageSizeChange={(size) => handleFilterChange({ page_size: size, page: 1 })}
                onOrderingChange={(field) => {
                  const newOrd = filters.ordering === field ? `-${field}` : field;
                  handleFilterChange({ ordering: newOrd });
                }}
                onSelectEmployee={(emp) => {
                  setSelectedEmployee(emp);
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Employee Registry (10,000 Scale) */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <FilterToolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onOpenAddModal={() => {
                if (isHR) {
                  setIsAddModalOpen(true);
                } else {
                  setToast({ type: 'info', message: 'Onboarding new hires is restricted to HR Managers.' });
                }
              }}
              onExportCsv={handleExportCsv}
              exporting={exporting}
              isHR={isHR}
            />

            <EmployeeTable
              employees={employees}
              totalCount={totalCount}
              currentPage={filters.page || 1}
              pageSize={filters.page_size || 25}
              totalPages={totalPages}
              loading={loadingList}
              ordering={filters.ordering}
              onPageChange={(page) => handleFilterChange({ page })}
              onPageSizeChange={(size) => handleFilterChange({ page_size: size, page: 1 })}
              onOrderingChange={(field) => {
                const newOrd = filters.ordering === field ? `-${field}` : field;
                handleFilterChange({ ordering: newOrd });
              }}
              onSelectEmployee={(emp) => {
                setSelectedEmployee(emp);
              }}
            />
          </div>
        )}

        {/* Tab 3: Pay Parity & Bands */}
        {activeTab === 'parity' && (
          <div className="space-y-6">
            <AnalyticsCharts
              departments={departments}
              geography={geography}
              parity={parity}
              loading={loadingAnalytics}
              selectedCurrency={selectedCurrency}
            />
          </div>
        )}
      </main>

      {/* Salary Revision Modal */}
      <ReviseSalaryModal
        employee={selectedEmployee}
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        onSuccess={handleSalaryRevisionSuccess}
        isHR={isHR}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddEmployeeSuccess}
        nextIdNumber={totalCount + 1}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 ACME Organization — Total Rewards & Workforce Compensation System.</p>
          <div className="flex items-center gap-4">
            <span>Candidate: Praveen Chaduvala (pchaduvala@gmail.com)</span>
            <span>•</span>
            <span>10,000 Records Scaled</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
