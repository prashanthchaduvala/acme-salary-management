import React from 'react';
import { DollarSign, TrendingUp, Users, Award, ShieldAlert } from 'lucide-react';
import { AnalyticsSummary, CurrencyRate } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface KPIHeaderProps {
  summary: AnalyticsSummary | null;
  loading: boolean;
  selectedCurrency: string;
  currencies: CurrencyRate[];
  isFiltered?: boolean;
}

export const KPIHeader: React.FC<KPIHeaderProps> = ({
  summary,
  loading,
  selectedCurrency,
  currencies,
  isFiltered,
}) => {
  // Find multiplier to convert USD to selected currency
  const currencyObj = currencies.find((c) => c.code === selectedCurrency);
  const rateToUsd = currencyObj ? Number(currencyObj.rate_to_usd) : 1.0;
  // If 1 EUR = 1.08 USD, then amount in EUR = amount in USD / 1.08
  const multiplier = rateToUsd > 0 ? 1.0 / rateToUsd : 1.0;

  const totalSpend = summary ? summary.total_spend_usd * multiplier : 0;
  const avgSalary = summary ? summary.avg_salary_usd * multiplier : 0;
  const medianSalary = summary ? summary.median_salary_usd * multiplier : 0;
  const minSalary = summary ? summary.min_salary_usd * multiplier : 0;
  const maxSalary = summary ? summary.max_salary_usd * multiplier : 0;
  const headcount = summary ? summary.headcount : 0;

  return (
    <div className="space-y-3">
      {isFiltered && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Active Filter Context: KPIs represent the filtered cohort of {formatNumber(headcount)} employees.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Payroll */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Annual Spend
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(totalSpend, selectedCurrency, true)}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">/ year</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {selectedCurrency === 'USD' ? 'Normalized USD base' : `Converted at 1 ${selectedCurrency} = $${rateToUsd.toFixed(4)}`}
          </p>
        </div>

        {/* KPI 2: Average Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mean Org Salary
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(avgSalary, selectedCurrency)}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">avg base</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Across {formatNumber(headcount)} employees
          </p>
        </div>

        {/* KPI 3: Median Salary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Median Salary
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(medianSalary, selectedCurrency)}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">50th %tile</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Range: {formatCurrency(minSalary, selectedCurrency, true)} – {formatCurrency(maxSalary, selectedCurrency, true)}
          </p>
        </div>

        {/* KPI 4: Total Headcount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Headcount
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatNumber(headcount)}
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">staff</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            8 Global Hubs (US, UK, DE, IN, SG, etc.)
          </p>
        </div>
      </div>
    </div>
  );
};
