import React, { useState, useEffect } from 'react';
import { X, History, ShieldCheck, Check, DollarSign } from 'lucide-react';
import { Employee, EmployeeDetail } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ReviseSalaryModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedEmployee: EmployeeDetail) => void;
}

const REASONS = [
  'Annual Merit Review',
  'Promotion to Senior Grade',
  'Market Compensation Alignment',
  'Internal Equity Parity Adjustment',
  'Role Expansion & Responsibility Increment',
  'Off-Cycle Performance Adjustment',
];

export const ReviseSalaryModal: React.FC<ReviseSalaryModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [bonusPct, setBonusPct] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employee) {
      setLoadingDetail(true);
      setError(null);
      api.getEmployee(employee.id)
        .then((res) => {
          setDetail(res);
          setNewSalary(String(res.salary_structure?.base_salary || employee.base_salary));
          setBonusPct(String(res.salary_structure?.bonus_percentage || employee.bonus_percentage));
        })
        .catch((err) => {
          setError('Failed to load employee details');
          console.error(err);
        })
        .finally(() => setLoadingDetail(false));
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const currentBase = Number(detail?.salary_structure?.base_salary || employee.base_salary);
  const proposedBase = Number(newSalary);
  const deltaPct = currentBase > 0 && proposedBase > 0
    ? (((proposedBase - currentBase) / currentBase) * 100).toFixed(1)
    : '0.0';

  const isIncrement = Number(deltaPct) > 0;
  const isDecrement = Number(deltaPct) < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedBase || proposedBase <= 0) {
      setError('Please provide a valid salary amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.reviseSalary(employee.id, {
        new_base_salary: proposedBase,
        reason,
        bonus_percentage: Number(bonusPct) || undefined,
        approved_by: 'Alex Rivera (HR Director)',
      });

      onSuccess(response.employee);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit salary revision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                {employee.employee_id}
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Salary Adjustment & Compensation Audit
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.full_name} • {employee.job_title} ({employee.department}) • {employee.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Current vs Proposed Compare Card */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Current Base Salary</span>
              <span className="text-xl font-mono font-extrabold text-slate-800 block mt-1">
                {formatCurrency(currentBase, employee.currency)}
              </span>
              <span className="text-[11px] text-slate-500">
                USD: {formatCurrency(employee.base_salary_usd, 'USD')}
              </span>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Proposed Base Salary</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-extrabold text-indigo-700">
                  {formatCurrency(proposedBase || 0, employee.currency)}
                </span>
                {deltaPct !== '0.0' && (
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                      isIncrement
                        ? 'bg-emerald-50 text-emerald-700'
                        : isDecrement
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isIncrement ? `+${deltaPct}%` : `${deltaPct}%`}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">Effective immediately upon submission</span>
            </div>
          </div>

          {/* Revision Form */}
          <form id="salary-revision-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Base Salary ({employee.currency}) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="100"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Bonus Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={bonusPct}
                  onChange={(e) => setBonusPct(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Revision *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </form>

          {/* Historical Revisions Audit Log */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Compensation Audit History ({detail?.revisions?.length || 0} adjustments)</span>
            </div>

            {loadingDetail ? (
              <div className="h-20 bg-slate-100 animate-pulse rounded-xl" />
            ) : detail?.revisions && detail.revisions.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {detail.revisions.map((rev) => (
                  <div key={rev.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{rev.reason}</div>
                      <div className="text-[10px] text-slate-400">
                        {formatDate(rev.effective_date)} • Approved by {rev.approved_by}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        {formatCurrency(rev.new_base, rev.currency)}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-600">
                        +{Number(rev.percentage_change).toFixed(1)}% increment
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No prior salary adjustments recorded on file.</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Audit record will be permanently signed and logged</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="salary-revision-form"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{submitting ? 'Updating...' : 'Confirm Revision'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
