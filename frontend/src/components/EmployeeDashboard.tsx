import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Download,
  Building2,
  MapPin,
  Clock,
  Sparkles,
  PieChart as PieChartIcon,
  CheckCircle2,
  Send,
  Search,
  Lock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { User, Employee } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface EmployeeDashboardProps {
  user: User;
  allEmployees: Employee[];
  selectedCurrency: string;
  onOpenSalaryInquiry: () => void;
  onDownloadPaystub: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  user,
  allEmployees,
  selectedCurrency,
  onOpenSalaryInquiry,
  onDownloadPaystub,
}) => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'timeline' | 'directory'>('rewards');
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Employee details fallback if not yet matched to specific DB row
  const record = user.employee_record || {
    employee_id: 'ACM-04313',
    full_name: `${user.first_name || 'Jessica'} ${user.last_name || 'Lewis'}`,
    email: user.email || 'jessica.lewis.4313@acme.org',
    job_title: user.role || 'Senior Software Engineer',
    department: user.department || 'Engineering',
    country: 'United States',
    city: 'San Francisco',
    currency: 'USD',
    base_salary: 145000,
    bonus_percentage: 15.0,
    net_annual_salary: 108750,
    housing_allowance: 7200,
    transport_allowance: 3600,
    tax_deduction_rate: 20.0,
    retirement_contribution: 5.0,
    hire_date: '2023-03-15',
    revisions: [
      {
        id: 101,
        previous_base: 130000,
        new_base: 145000,
        percentage_change: 11.54,
        effective_date: '2025-04-01',
        reason: 'Promotion to Senior Grade & Merit Adjustment',
        approved_by: 'Prashanth Chaduvala (Head of HR)',
      },
      {
        id: 102,
        previous_base: 118000,
        new_base: 130000,
        percentage_change: 10.17,
        effective_date: '2024-03-15',
        reason: 'Annual Performance Review Merit Increase',
        approved_by: 'Alex Rivera (Total Rewards)',
      },
    ],
  };

  const fullName = record.full_name || `${user.first_name || 'Jessica'} ${user.last_name || 'Lewis'}`;
  const currency = record.currency || selectedCurrency || 'USD';
  const baseSalary = Number(record.base_salary) || 145000;
  const bonusPct = Number(record.bonus_percentage) || 15;
  const targetBonusAmount = (baseSalary * bonusPct) / 100;
  const allowances = (record.housing_allowance || 0) + (record.transport_allowance || 0);
  const totalRewardsValue = baseSalary + targetBonusAmount + allowances + 12000; // Includes healthcare & 401k match
  const monthlyGross = baseSalary / 12;
  const monthlyNet = monthlyGross * (1 - (record.tax_deduction_rate || 20) / 100 - (record.retirement_contribution || 5) / 100);

  // Compensation distribution data for pie chart
  const rewardsBreakdown = [
    { name: 'Base Salary', value: baseSalary, color: '#4f46e5' },
    { name: 'Performance Bonus', value: targetBonusAmount, color: '#10b981' },
    { name: 'Allowances', value: allowances || 10800, color: '#06b6d4' },
    { name: 'Benefits & 401k Match', value: 12000, color: '#8b5cf6' },
  ];

  // Directory filter
  const filteredEmployees = allEmployees
    .filter((emp) => {
      const matchSearch =
        directorySearch === '' ||
        emp.full_name.toLowerCase().includes(directorySearch.toLowerCase()) ||
        emp.job_title.toLowerCase().includes(directorySearch.toLowerCase()) ||
        emp.department.toLowerCase().includes(directorySearch.toLowerCase()) ||
        emp.city.toLowerCase().includes(directorySearch.toLowerCase());
      const matchDept = selectedDept === 'All' || emp.department === selectedDept;
      return matchSearch && matchDept;
    })
    .slice(0, 15);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Hero Portal Header (Personalized ESS) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 text-white">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-lg shadow-emerald-500/30 ring-4 ring-white/10 shrink-0">
              {fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{fullName}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Staff Self-Service
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-slate-300">
                  ID: {record.employee_id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="font-semibold text-white">{record.job_title}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {record.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {record.city}, {record.country}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Payday & Deposit Status Pill */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Next Payday Deposit
              </span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-4 h-4" />
                Nov 30, 2026 (Monthly)
              </span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-white/10" />
            <button
              onClick={onDownloadPaystub}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Paystub</span>
            </button>
          </div>
        </div>

        {/* Sub-bar tabs */}
        <div className="relative z-10 flex items-center gap-2 mt-6 sm:mt-8 pt-4 border-t border-white/10 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'rewards'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
            <span>Compensation & Benefits</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Growth & Promotions</span>
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'directory'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Teammates Directory</span>
          </button>
        </div>
      </div>

      {/* 2. Tab 1: My Compensation & Benefits */}
      {activeTab === 'rewards' && (
        <div className="space-y-8 animate-fade-in">
          {/* 4 Financial Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Annual Base */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Annual Base Salary</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black font-mono text-slate-900 block">
                  {formatCurrency(baseSalary, currency)}
                </span>
                <span className="text-xs text-slate-500 mt-1 block font-medium">
                  Gross Monthly: {formatCurrency(monthlyGross, currency)}/mo
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active 2026 Guaranteed Base</span>
              </div>
            </div>

            {/* Card 2: Performance Target Bonus */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Annual Bonus</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {bonusPct.toFixed(1)}%
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    ({formatCurrency(targetBonusAmount, currency)})
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-1 block font-medium">
                  Annual corporate & personal goals
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-indigo-600 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Next Assessment: Q4 2026</span>
              </div>
            </div>

            {/* Card 3: Estimated Monthly Net Take-Home */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Est. Monthly Take-Home</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black font-mono text-emerald-600 block">
                  {formatCurrency(monthlyNet, currency)}
                </span>
                <span className="text-xs text-slate-500 mt-1 block font-medium">
                  After est. tax (20%) & 401k (5%)
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Disbursed last banking day of month</span>
              </div>
            </div>

            {/* Card 4: Total Rewards Value */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Total Rewards Package</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <PieChartIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black font-mono text-indigo-700 block">
                  {formatCurrency(totalRewardsValue, currency)}
                </span>
                <span className="text-xs text-indigo-600/80 mt-1 block font-medium">
                  Base + Bonus + Perks + Employer Match
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-100/60 flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Complete ACME benefits tier</span>
              </div>
            </div>
          </div>

          {/* Interactive Visualizations: Pie Chart & Paycheck Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Total Rewards Composition */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Total Rewards Allocation</h3>
                    <p className="text-xs text-slate-500">Breakdown of your annualized compensation package</p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {formatCurrency(totalRewardsValue, currency)}
                  </span>
                </div>

                <div className="h-64 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rewardsBreakdown}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {rewardsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: number) => [formatCurrency(val, currency), 'Value']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                {rewardsBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}:</span>
                    <span className="font-bold text-slate-900 ml-auto font-mono">
                      {((item.value / totalRewardsValue) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Monthly Paycheck Simulator & Allowances */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Paycheck Simulation</h3>
                <p className="text-xs text-slate-500">Estimated monthly disbursement structure</p>

                <div className="mt-5 space-y-3.5 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-700">Gross Monthly Base</span>
                    <span className="font-mono font-bold text-slate-900">
                      +{formatCurrency(monthlyGross, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-800">
                    <div>
                      <span className="font-semibold block">Statutory Income Tax Withholding</span>
                      <span className="text-[10px] text-rose-600">Standard rate: {record.tax_deduction_rate || 20}%</span>
                    </div>
                    <span className="font-mono font-bold">
                      -{formatCurrency((monthlyGross * (record.tax_deduction_rate || 20)) / 100, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-indigo-800">
                    <div>
                      <span className="font-semibold block">Retirement Pension / 401(k) Match</span>
                      <span className="text-[10px] text-indigo-600">Employee contribution: {record.retirement_contribution || 5}%</span>
                    </div>
                    <span className="font-mono font-bold">
                      -{formatCurrency((monthlyGross * (record.retirement_contribution || 5)) / 100, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                    <div>
                      <span className="text-xs uppercase font-extrabold tracking-wider block opacity-90">
                        Net Estimated Deposit
                      </span>
                      <span className="text-[11px] opacity-80">Credited to Verified Bank Account</span>
                    </div>
                    <span className="text-xl font-mono font-black">
                      {formatCurrency(monthlyNet, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inquiry Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">Have questions about your compensation?</span>
                <button
                  onClick={onOpenSalaryInquiry}
                  className="w-full sm:w-auto justify-center px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Contact HR Team</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Tab 2: Salary Growth & Progression Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-bold text-slate-900">My Career & Salary Progression at ACME</h3>
            <p className="text-xs text-slate-500">Historical compensation milestones and merit increments</p>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-100">
            {record.revisions && record.revisions.length > 0 ? (
              record.revisions.map((rev, idx) => (
                <div key={rev.id || idx} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{rev.reason}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            +{Number(rev.percentage_change).toFixed(1)}% Increment
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Effective Date: {formatDate(rev.effective_date)} • Authorized by {rev.approved_by}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 block line-through font-mono">
                          {formatCurrency(rev.previous_base, currency)}
                        </span>
                        <span className="text-lg font-black font-mono text-indigo-700">
                          {formatCurrency(rev.new_base, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No previous adjustments recorded.</p>
            )}

            {/* Starting Offer Card */}
            <div className="relative">
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-slate-400 ring-4 ring-slate-100 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Initial Employment & Welcome Offer</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Hire Date: {formatDate(record.hire_date || '2023-03-15')} • Joined ACME Organization
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 font-mono">
                    Starting Base
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab 3: Company Teammates (Directory View) */}
      {activeTab === 'directory' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">ACME Global Teammates</h3>
              <p className="text-xs text-slate-500">
                Search and connect with colleagues across 8 international hubs (Staff Directory View)
              </p>
            </div>

            {/* Search & Dept Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
              </select>

              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search colleague by name, title..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Colleague Privacy Protection:</strong> As a staff member, individual compensation figures of your peers are kept private and confidential. Only HR Management can view organizational payroll structures.
            </span>
          </div>

          {/* Colleague Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredEmployees.map((colleague) => (
              <div
                key={colleague.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-indigo-200 hover:shadow-md transition flex items-start justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {colleague.first_name[0]}
                    {colleague.last_name[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{colleague.full_name}</h4>
                    <p className="text-[11px] text-indigo-600 font-medium">{colleague.job_title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>{colleague.department}</span>
                      <span>•</span>
                      <span>{colleague.country}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                  {colleague.employment_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
