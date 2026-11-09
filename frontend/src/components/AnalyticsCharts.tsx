import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DepartmentMetric, GeoMetric, PayParityData } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { PieChart as PieIcon, MapPin, Scale } from 'lucide-react';

interface AnalyticsChartsProps {
  departments: DepartmentMetric[];
  geography: GeoMetric[];
  parity: PayParityData | null;
  loading: boolean;
  selectedCurrency: string;
  onFilterDepartment?: (dept: string) => void;
  onFilterCountry?: (country: string) => void;
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#64748b'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  departments,
  geography,
  parity,
  loading,
  selectedCurrency,
  onFilterDepartment,
  onFilterCountry,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
        <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse p-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Charts: Department & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Spend Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Department Spend & Headcount
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Annual payroll allocation across ACME operational divisions
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              Click bar to filter
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departments}
                margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length && onFilterDepartment) {
                    onFilterDepartment(e.activePayload[0].payload.department);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'total_spend_usd') return [formatCurrency(value, selectedCurrency, true), 'Total Spend'];
                    return [value, name];
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total_spend_usd" radius={[6, 6, 0, 0]}>
                  {departments.map((_, index) => (
                    <Cell
                      key={`dept-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Geographic Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Global Headcount by Region
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff distribution across international subsidiaries
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              8 Hubs
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={geography}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length && onFilterCountry) {
                    onFilterCountry(e.activePayload[0].payload.country);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  dataKey="country"
                  type="category"
                  tick={{ fill: '#0f172a', fontSize: 11, fontWeight: 500 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'headcount') return [`${formatNumber(value)} employees`, 'Headcount'];
                    return [value, name];
                  }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="headcount" fill="#10b981" radius={[0, 6, 6, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pay Equity & Salary Bands Strip */}
      {parity && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold">Pay Parity & Salary Tier Analytics</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executive pay equity audit — comparing compensation bands and cross-demographic ratios
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/10 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Female to Male Ratio</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {parity.female_to_male_ratio_pct}%
                </span>
                <span className="text-[10px] text-slate-400 ml-1">parity index</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {parity.salary_bands.map((band) => (
              <div key={band.band} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-xs font-semibold text-indigo-300 block">{band.band}</span>
                <span className="text-lg font-black text-white mt-1 block">{formatNumber(band.headcount)}</span>
                <span className="text-[10px] text-slate-400">employees in band</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
