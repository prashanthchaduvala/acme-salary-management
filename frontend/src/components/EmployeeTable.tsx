import React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { Employee } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface EmployeeTableProps {
  employees: Employee[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  ordering?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onOrderingChange: (field: string) => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  totalCount,
  currentPage,
  pageSize,
  totalPages,
  loading,
  ordering = '-hire_date',
  onPageChange,
  onPageSizeChange,
  onOrderingChange,
  onSelectEmployee,
}) => {
  const getSortIcon = (field: string) => {
    const isAsc = ordering === field;
    const isDesc = ordering === `-${field}`;
    return (
      <ArrowUpDown
        className={`w-3.5 h-3.5 ml-1 transition ${
          isAsc || isDesc ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
        }`}
      />
    );
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Table Top Header: Row counts & page size selector */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
        <div className="text-xs font-medium text-slate-600">
          Showing <span className="font-bold text-slate-900">{totalCount > 0 ? startRecord : 0}</span> to{' '}
          <span className="font-bold text-slate-900">{endRecord}</span> of{' '}
          <span className="font-bold text-slate-900">{formatNumber(totalCount)}</span> employees
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <label htmlFor="page-size-select">Rows per page:</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">
                <button
                  onClick={() => onOrderingChange('employee_id')}
                  className="group flex items-center hover:text-slate-900"
                >
                  ID {getSortIcon('employee_id')}
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => onOrderingChange('last_name')}
                  className="group flex items-center hover:text-slate-900"
                >
                  Employee {getSortIcon('last_name')}
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => onOrderingChange('department')}
                  className="group flex items-center hover:text-slate-900"
                >
                  Department & Role {getSortIcon('department')}
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => onOrderingChange('country')}
                  className="group flex items-center hover:text-slate-900"
                >
                  Location {getSortIcon('country')}
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => onOrderingChange('base_salary_usd')}
                  className="group flex items-center ml-auto hover:text-slate-900"
                >
                  Base (Local) {getSortIcon('base_salary_usd')}
                </button>
              </th>
              <th className="py-3 px-4 text-center">Bonus %</th>
              <th className="py-3 px-4 text-right">Net Annual</th>
              <th className="py-3 px-4 text-right">USD Normalized</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="py-3.5 px-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><div className="h-4 w-10 bg-slate-200 rounded mx-auto" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-3.5 px-4 text-right"><div className="h-4 w-20 bg-slate-200 rounded ml-auto" /></td>
                  <td className="py-3.5 px-4 text-center"><div className="h-6 w-16 bg-slate-200 rounded mx-auto" /></td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <p className="text-sm font-semibold">No employees match the current filters.</p>
                  <p className="text-xs text-slate-400 mt-1">Try relaxing search keywords or filter dropdowns.</p>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-indigo-50/40 transition group cursor-pointer"
                  onClick={() => onSelectEmployee(emp)}
                >
                  {/* Code */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200/60">
                      {emp.employee_id}
                    </span>
                  </td>

                  {/* Employee Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {emp.full_name}
                    </div>
                    <div className="text-[11px] text-slate-400">{emp.email}</div>
                  </td>

                  {/* Department & Role */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 mb-0.5">
                      {emp.department}
                    </span>
                    <div className="text-slate-600 font-medium text-[11px] truncate max-w-[160px]">
                      {emp.job_title}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{emp.country}</div>
                    <div className="text-[11px] text-slate-400">{emp.city}</div>
                  </td>

                  {/* Local Base Salary */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(emp.base_salary, emp.currency)}
                  </td>

                  {/* Bonus % */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                      {Number(emp.bonus_percentage)}%
                    </span>
                  </td>

                  {/* Net Annual */}
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatCurrency(emp.net_annual_salary, emp.currency)}
                  </td>

                  {/* Normalized USD */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-700">
                    {formatCurrency(emp.base_salary_usd, 'USD')}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectEmployee(emp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                      title="Adjust compensation"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Revise</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
        <div className="text-xs text-slate-500">
          Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
          <span className="font-bold text-slate-800">{totalPages || 1}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
            {currentPage}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
