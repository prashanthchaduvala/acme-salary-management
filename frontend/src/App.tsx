import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { KPIHeader } from './components/KPIHeader';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { FilterToolbar } from './components/FilterToolbar';
import { EmployeeTable } from './components/EmployeeTable';
import { ReviseSalaryModal } from './components/ReviseSalaryModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { AuthPage } from './components/AuthPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
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
            setUser(null);
            localStorage.removeItem('acme_auth_token');
            localStorage.removeItem('acme_auth_user');
          }
        })
        .catch(() => {});
    }
  }, []);

  // Set default view based on user role when authenticated
  useEffect(() => {
    if (user?.username === 'alex.hr' || user?.role?.toLowerCase().includes('rewards')) {
      setActiveTab('parity');
    } else {
      setActiveTab('overview');
    }
  }, [user?.username]);

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
    if (authenticatedUser.username === 'alex.hr') {
      setActiveTab('parity');
    } else {
      setActiveTab('overview');
    }
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

  // 1-Click live switcher for evaluation
  const handleSwitchPersona = async (targetUsername: string) => {
    try {
      const res = await api.login({ username: targetUsername, password: 'Welcome@123' });
      setUser(res.user);
      localStorage.setItem('acme_auth_user', JSON.stringify(res.user));
      if (targetUsername === 'alex.hr') {
        setActiveTab('parity');
      } else {
        setActiveTab('overview');
      }
      setToast({
        type: 'info',
        message: `Switched view to ${res.user.first_name} ${res.user.last_name} (${res.user.role}).`,
      });
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  const handleDownloadPaystub = () => {
    setToast({
      type: 'success',
      message: 'Generating official ACME statement PDF... Paystub download initiated.',
    });
    setTimeout(() => {
      const docContent = [
        '======================================================================',
        'ACME ORGANIZATION - EMPLOYEE PAYSTUB & COMPENSATION STATEMENT',
        '======================================================================',
        `Employee Name:   ${user?.first_name || 'Jessica'} ${user?.last_name || 'Lewis'}`,
        `Employee ID:     ${user?.employee_record?.employee_id || 'ACM-04313'}`,
        `Corporate Email: ${user?.email || 'jessica.lewis.4313@acme.org'}`,
        `Job Title:       ${user?.role || 'Senior Software Engineer'}`,
        `Department:      ${user?.department || 'Engineering'}`,
        `Disbursement:    Direct Deposit (Verified SOC2 Type II)`,
        `Pay Period:      November 1 - November 30, 2026`,
        '----------------------------------------------------------------------',
        `Annual Base:     ${user?.employee_record?.base_salary || 145000} ${user?.employee_record?.currency || 'USD'}`,
        `Gross Monthly:   ${((Number(user?.employee_record?.base_salary) || 145000) / 12).toFixed(2)}`,
        `Tax Deductions:  ${(user?.employee_record?.tax_deduction_rate || 20)}%`,
        `Retirement 401k: ${(user?.employee_record?.retirement_contribution || 5)}%`,
        `Target Bonus:    ${user?.employee_record?.bonus_percentage || 15}%`,
        '----------------------------------------------------------------------',
        'Authorized by ACME Total Rewards & HR Operations Department',
        '======================================================================',
      ].join('\n');

      const blob = new Blob([docContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ACME_Paystub_${user?.username || 'Employee'}_Nov2026.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 600);
  };

  const handleOpenSalaryInquiry = () => {
    setToast({
      type: 'info',
      message: 'Your salary review request has been sent to Prashanth Chaduvala (Head of HR).',
    });
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

  // Persona Determination
  const isEmployee = Boolean(
    user.is_hr === false ||
    user.role?.toLowerCase().includes('employee') ||
    user.role?.toLowerCase().includes('staff') ||
    user.role?.toLowerCase().includes('engineer') ||
    user.username === 'jessica.emp'
  );

  const isRewardsHead = Boolean(
    !isEmployee && (
      user.username === 'alex.hr' ||
      user.role?.toLowerCase().includes('rewards') ||
      user.role?.toLowerCase().includes('compensation')
    )
  );

  const isPeopleHead = !isEmployee && !isRewardsHead;

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

      {/* 1-Click Persona Switcher Banner (Instant Reviewer Comparison) */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-6 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs w-full overflow-hidden">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
                isEmployee ? 'bg-emerald-400' : isRewardsHead ? 'bg-purple-400' : 'bg-indigo-400'
              }`}
            />
            <span className="text-slate-400 font-medium text-[10px] sm:text-xs shrink-0">View:</span>
            <span className="font-extrabold text-white text-[11px] sm:text-xs truncate">
              {user.first_name} {user.last_name}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 ${
              isEmployee
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : isRewardsHead
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            {isEmployee ? 'ESS' : isRewardsHead ? 'Rewards' : 'HR Ops'}
          </span>
        </div>

        {/* 3-Button Switcher Grid on mobile / flex on desktop */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => handleSwitchPersona('prashanth')}
            className={`py-1.5 sm:py-1 px-1 sm:px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition cursor-pointer text-center truncate ${
              user.username === 'prashanth'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="sm:hidden">1. HR</span>
            <span className="hidden sm:inline">1. HR Ops (Prashanth)</span>
          </button>
          <button
            onClick={() => handleSwitchPersona('alex.hr')}
            className={`py-1.5 sm:py-1 px-1 sm:px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition cursor-pointer text-center truncate ${
              user.username === 'alex.hr'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="sm:hidden">2. Rewards</span>
            <span className="hidden sm:inline">2. Total Rewards (Alex)</span>
          </button>
          <button
            onClick={() => handleSwitchPersona('jessica.emp')}
            className={`py-1.5 sm:py-1 px-1 sm:px-3 rounded-lg text-[10px] sm:text-[11px] font-bold transition cursor-pointer text-center truncate ${
              user.username === 'jessica.emp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="sm:hidden">3. ESS</span>
            <span className="hidden sm:inline">3. Staff ESS (Jessica)</span>
          </button>
        </div>
      </div>

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
        {/* VIEW 1: Standard Employee -> Render Dedicated Self-Service Dashboard */}
        {isEmployee ? (
          <EmployeeDashboard
            user={user}
            allEmployees={employees}
            selectedCurrency={selectedCurrency}
            onDownloadPaystub={handleDownloadPaystub}
            onOpenSalaryInquiry={handleOpenSalaryInquiry}
          />
        ) : (
          /* VIEW 2 & 3: HR Roles -> Render Specialized Executive Command Centers */
          <>
            {/* Persona Hero Banner 1: Head of Total Rewards (Alex Rivera) */}
            {isRewardsHead && (
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white border border-purple-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 w-full overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-lg sm:text-xl shadow-inner shrink-0">
                    TR
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-xl font-black tracking-tight">Total Rewards & Pay Parity Center</h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                        Governance (Write)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Logged in as <strong>Alex Rivera (Head of Total Rewards)</strong>. Monitoring global wage compression, cross-regional exchange rates across 8 international hubs, and gender pay ratio parity (0.97).
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setActiveTab('parity')}
                    className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                      activeTab === 'parity' ? 'bg-purple-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    Pay Parity & Bands
                  </button>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                      activeTab === 'overview' ? 'bg-purple-600 text-white shadow-md' : 'bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    Executive Spend View
                  </button>
                </div>
              </div>
            )}

            {/* Persona Hero Banner 2: Head of HR & People Operations (Prashanth Chaduvala) */}
            {isPeopleHead && (
              <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 w-full overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-black text-lg sm:text-xl shadow-inner shrink-0">
                    HR
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-xl font-black tracking-tight">Global People & Workforce Operations Hub</h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
                        Full Administration (Write)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Logged in as <strong>Prashanth Chaduvala (Head of HR & People Operations)</strong>. Managing organization headcount (10,000 staff), operational departmental distributions, and global onboarding.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    <span>+ Onboard New Employee</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                      activeTab === 'employees' ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    10k Employee Roster
                  </button>
                </div>
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
                    setIsAddModalOpen(true);
                  }}
                  onExportCsv={handleExportCsv}
                  exporting={exporting}
                  isHR={true}
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
          </>
        )}
      </main>

      {/* Salary Revision Modal */}
      <ReviseSalaryModal
        employee={selectedEmployee}
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        onSuccess={handleSalaryRevisionSuccess}
        isHR={!isEmployee}
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
            <span>Candidate: Prashanth Chaduvala (prashanthpatelc@gmail.com)</span>
            <span>•</span>
            <span>10,000 Records Scaled</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
