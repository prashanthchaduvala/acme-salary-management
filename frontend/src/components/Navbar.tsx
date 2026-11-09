import React from 'react';
import { Building2, Globe, ShieldCheck, Users, LogIn, LogOut } from 'lucide-react';
import { CurrencyRate, User } from '../types';

interface NavbarProps {
  totalHeadcount?: number;
  currencies: CurrencyRate[];
  selectedCurrency: string;
  onSelectCurrency: (currency: string) => void;
  activeTab: 'overview' | 'employees' | 'parity';
  setActiveTab: (tab: 'overview' | 'employees' | 'parity') => void;
  user: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalHeadcount = 10000,
  currencies,
  selectedCurrency,
  onSelectCurrency,
  activeTab,
  setActiveTab,
  user,
  onOpenAuthModal,
  onLogout,
}) => {
  const isHR = user
    ? user.is_hr !== false &&
      !user.role?.toLowerCase().includes('employee') &&
      !user.role?.toLowerCase().includes('staff')
    : true;

  const getInitials = (u: User) => {
    if (u.first_name && u.last_name) {
      return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase();
    }
    return u.username.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 ${
                  isHR
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-200'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-200'
                }`}
              >
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">ACME</span>
                  {isHR ? (
                    <span className="hidden md:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      HR Compensation
                    </span>
                  ) : (
                    <span className="hidden md:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Employee Portal (ESS)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block truncate">
                  {isHR ? 'Enterprise Salary Management' : 'My Compensation & Teammates'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Displayed for HR Administrators) */}
            {isHR && (
              <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-slate-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Executive Overview
                </button>
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'employees'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Employee Registry (10k)
                </button>
                <button
                  onClick={() => setActiveTab('parity')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === 'parity'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Pay Parity & Bands
                </button>
              </nav>
            )}
          </div>

          {/* Right Controls: Currency Toggle & Auth */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Currency selector */}
            <div className="flex items-center gap-1 bg-slate-100 px-2 py-1.5 rounded-xl border border-slate-200/80">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label htmlFor="currency-select" className="text-xs font-medium text-slate-600 hidden md:inline">
                Currency:
              </label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => onSelectCurrency(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Headcount Badge (Desktop only) */}
            {isHR ? (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{totalHeadcount.toLocaleString()} Staff</span>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Deposit</span>
              </div>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1.5 sm:pl-3 border-l border-slate-200 shrink-0">
                <div
                  title={`${user.first_name || user.username} (${user.role || 'HR'})`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 shrink-0 ${
                    isHR
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 ring-indigo-500/20'
                      : 'bg-gradient-to-tr from-teal-600 to-emerald-500 ring-emerald-500/20'
                  }`}
                >
                  {getInitials(user)}
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out of Workspace"
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition text-xs font-bold cursor-pointer shadow-xs shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pl-2 sm:pl-3 border-l border-slate-200">
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs shadow-indigo-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Sub-Navigation (Full width 3-button equal grid on phone/tablet for HR) */}
      {isHR && user && (
        <div className="grid grid-cols-3 gap-1 px-2.5 py-1.5 border-t border-slate-200/80 bg-slate-50 md:hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center truncate transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center truncate transition cursor-pointer ${
              activeTab === 'employees'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80'
            }`}
          >
            10k Roster
          </button>
          <button
            onClick={() => setActiveTab('parity')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center truncate transition cursor-pointer ${
              activeTab === 'parity'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80'
            }`}
          >
            Pay Parity
          </button>
        </div>
      )}
    </header>
  );
};
