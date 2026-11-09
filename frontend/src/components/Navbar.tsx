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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
                  isHR
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-indigo-200'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">ACME</span>
                  {isHR ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      HR Compensation
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Employee Portal (ESS)
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {isHR ? 'Enterprise Salary Management' : 'My Compensation & Teammates'}
                </p>
              </div>
            </div>

            {/* Navigation Tabs (Displayed for HR Administrators) */}
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
          <div className="flex items-center gap-3">
            {/* Currency selector */}
            <div className="flex items-center gap-2 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
              <Globe className="w-4 h-4 text-slate-500" />
              <label htmlFor="currency-select" className="text-xs font-medium text-slate-600">
                Currency:
              </label>
              <select
                id="currency-select"
                value={selectedCurrency}
                onChange={(e) => onSelectCurrency(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Headcount Badge (for HR) or Verification Badge (for Employee) */}
            {isHR ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{totalHeadcount.toLocaleString()} Staff</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Direct Deposit</span>
              </div>
            )}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ${
                      isHR
                        ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 ring-indigo-500/20'
                        : 'bg-gradient-to-tr from-teal-600 to-emerald-500 ring-emerald-500/20'
                    }`}
                  >
                    {getInitials(user)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-900 leading-none">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                      </p>
                      {isHR ? (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          HR Admin
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Staff (Read-Only)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isHR ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-indigo-600" />
                          <span className="text-[10px] text-slate-500 font-medium">{user.role || 'HR Lead'}</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] text-slate-500 font-medium">{user.role || 'Staff Member'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign Out of Workspace"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition text-xs font-bold cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pl-3 border-l border-slate-200">
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs shadow-indigo-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>HR Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
