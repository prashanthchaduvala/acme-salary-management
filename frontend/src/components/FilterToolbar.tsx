import React, { useState, useEffect } from 'react';
import { Search, Download, UserPlus, RotateCcw, Lock } from 'lucide-react';
import { FilterParams } from '../types';

interface FilterToolbarProps {
  filters: FilterParams;
  onFilterChange: (filters: Partial<FilterParams>) => void;
  onReset: () => void;
  onOpenAddModal: () => void;
  onExportCsv: () => void;
  exporting?: boolean;
  isHR?: boolean;
}

const DEPARTMENTS = [
  'All', 'Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'
];

const COUNTRIES = [
  'All', 'United States', 'United Kingdom', 'Germany', 'India', 'Singapore', 'Japan', 'Australia', 'Canada'
];

const CURRENCIES = ['All', 'USD', 'EUR', 'GBP', 'INR', 'SGD', 'JPY', 'AUD', 'CAD'];
const GENDERS = ['All', 'Female', 'Male', 'Non-Binary', 'Prefer not to say'];
const STATUSES = ['All', 'Full-Time', 'Contract', 'Part-Time'];

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onOpenAddModal,
  onExportCsv,
  exporting,
  isHR = true,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Debounce search by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== (filters.search || '')) {
        onFilterChange({ search: searchTerm, page: 1 });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, filters.search, onFilterChange]);

  const hasActiveFilters = Boolean(
    (filters.department && filters.department !== 'All') ||
    (filters.country && filters.country !== 'All') ||
    (filters.currency && filters.currency !== 'All') ||
    (filters.gender && filters.gender !== 'All') ||
    (filters.employment_status && filters.employment_status !== 'All') ||
    filters.search
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
      {/* Search and Primary Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Full-text search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, employee ID, role, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onFilterChange({ search: '', page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Buttons: Export & Add */}
        <div className="flex items-center gap-2.5">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}

          <button
            onClick={onExportCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {isHR ? (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          ) : (
            <button
              disabled
              title="HR Manager permission required to onboard new employees"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl border border-slate-200 cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Employee (HR Only)</span>
            </button>
          )}
        </div>
      </div>

      {/* Faceted Dropdown Selectors */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-500">Filter By:</span>

        {/* Department */}
        <select
          value={filters.department || 'All'}
          onChange={(e) => onFilterChange({ department: e.target.value, page: 1 })}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              Dept: {d}
            </option>
          ))}
        </select>

        {/* Country */}
        <select
          value={filters.country || 'All'}
          onChange={(e) => onFilterChange({ country: e.target.value, page: 1 })}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              Country: {c}
            </option>
          ))}
        </select>

        {/* Currency */}
        <select
          value={filters.currency || 'All'}
          onChange={(e) => onFilterChange({ currency: e.target.value, page: 1 })}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {CURRENCIES.map((cur) => (
            <option key={cur} value={cur}>
              Currency: {cur}
            </option>
          ))}
        </select>

        {/* Gender */}
        <select
          value={filters.gender || 'All'}
          onChange={(e) => onFilterChange({ gender: e.target.value, page: 1 })}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              Gender: {g}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.employment_status || 'All'}
          onChange={(e) => onFilterChange({ employment_status: e.target.value, page: 1 })}
          className="text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
