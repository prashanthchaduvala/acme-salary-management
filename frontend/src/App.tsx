import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { KPIHeader } from './components/KPIHeader';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { FilterToolbar } from './components/FilterToolbar';
import { EmployeeTable } from './components/EmployeeTable';
import { ReviseSalaryModal } from './components/ReviseSalaryModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { AuthModal } from './components/AuthModal';
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

  // Auth State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('acme_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // 1. Load initial static metadata (currencies & sync current user)
  useEffect(() => {
    api.getCurrencies()
      .then((data) => setCurrencies(data))
      .catch((err) => console.error('Failed to load currencies:', err));

    api.getMe()
      .then((res) => {
        if (res.isAuthenticated && res.user) {
          setUser(res.user);
          localStorage.setItem('acme_auth_user', JSON.stringify(res.user));
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch Employee Table Data
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
    fetchEmployees();
  }, [fetchEmployees]);

  // 3. Fetch Executive Analytics
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
    fetchAnalytics();
  }, [fetchAnalytics]);

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
    setToast({
      type: 'success',
      message: `Welcome back, ${authenticatedUser.first_name || authenticatedUser.username}! (${authenticatedUser.role || 'HR Lead'})`,
    });
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setToast({ type: 'info', message: 'You have been signed out safely.' });
  };

  const totalPages = Math.ceil(totalCount / (filters.page_size || 25));

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
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
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
                  if (!user) {
                    setIsAuthModalOpen(true);
                    setToast({ type: 'info', message: 'Please sign in to adjust compensation records.' });
                  } else {
                    setSelectedEmployee(emp);
                  }
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
                if (!user) {
                  setIsAuthModalOpen(true);
                  setToast({ type: 'info', message: 'Please sign in to add new employees.' });
                } else {
                  setIsAddModalOpen(true);
                }
              }}
              onExportCsv={handleExportCsv}
              exporting={exporting}
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
                if (!user) {
                  setIsAuthModalOpen(true);
                  setToast({ type: 'info', message: 'Please sign in to adjust compensation records.' });
                } else {
                  setSelectedEmployee(emp);
                }
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

      {/* Auth Modal (Sign In & Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Salary Revision Modal */}
      <ReviseSalaryModal
        employee={selectedEmployee}
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        onSuccess={handleSalaryRevisionSuccess}
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
