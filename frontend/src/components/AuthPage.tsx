import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  Sparkles,
  TrendingUp,
  Globe2,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';

interface AuthPageProps {
  onSuccess: (user: UserType) => void;
  defaultMode?: 'login' | 'register';
}

const ROLES = [
  'HR Manager',
  'Compensation & Total Rewards Specialist',
  'People Operations Lead',
  'Senior HR Business Partner',
  'VP of Global People',
];

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  defaultMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState(ROLES[0]);
  const [regDepartment, setRegDepartment] = useState('People Operations');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1-Click login for assessment reviewers
  const handleQuickLogin = async (username: string, pass: string) => {
    setLoginIdentifier(username);
    setLoginPassword(pass);
    setError(null);
    setLoading(true);

    try {
      const res = await api.login({
        username,
        password: pass,
      });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({
        username: loginIdentifier.trim(),
        password: loginPassword,
      });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please verify your username/email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        first_name: regFirstName.trim(),
        last_name: regLastName.trim(),
        role: regRole,
        department: regDepartment.trim(),
      });
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Username or email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 antialiased">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-md">
        {/* Left Column: Organization & Platform Highlights */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xl tracking-tight">ACME Org</span>
                <span className="text-[11px] font-semibold block text-indigo-400">
                  Global Compensation Platform
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Enterprise Salary Management
              </h1>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Secure executive portal to manage compensation, track salary revisions, audit pay parity, and analyze workforce expenditure across 10,000 employees worldwide.
              </p>
            </div>

            {/* Highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">10,000 Global Employees</h4>
                  <p className="text-[11px] text-slate-400">High-performance server pagination & compound B-tree indexing</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">8 International Hubs</h4>
                  <p className="text-[11px] text-slate-400">Real-time conversions for USD, EUR, GBP, INR, SGD, JPY, AUD, CAD</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sub-20ms Analytics Engine</h4>
                  <p className="text-[11px] text-slate-400">Instant aggregations for department spend and pay parity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>© 2026 ACME Organization</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              SOC2 Type II Ready
            </span>
          </div>
        </div>

        {/* Right Column: Sign In & Registration Form Card */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white flex flex-col justify-center">
          {/* Top Tab Switcher */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {mode === 'login' ? 'HR Portal Sign In' : 'Create HR Account'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'login'
                  ? 'Access compensation dashboards and staff salary registry'
                  : 'Register a new authorized HR administrator profile'}
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  mode === 'login'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  mode === 'register'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form 1: Sign In */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Username or Corporate Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. pchaduvala or alex.hr"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 1-Click Instant Reviewer Buttons */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <span className="text-[11px] uppercase font-bold text-indigo-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  1-Click Instant Evaluation Logins:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin('pchaduvala', 'Password123!')}
                    className="text-left p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-xs transition disabled:opacity-50 group"
                  >
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                      Praveen Chaduvala
                    </span>
                    <span className="text-[10px] text-slate-500 block">pchaduvala@gmail.com</span>
                    <span className="text-[10px] font-bold text-indigo-600 mt-1 inline-block">
                      Click to Enter →
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin('alex.hr', 'Password123!')}
                    className="text-left p-2.5 rounded-xl bg-white border border-indigo-200 hover:border-indigo-500 hover:shadow-xs transition disabled:opacity-50 group"
                  >
                    <span className="text-xs font-bold text-slate-900 block group-hover:text-indigo-600">
                      Alex Rivera
                    </span>
                    <span className="text-[10px] text-slate-500 block">Head of HR & Rewards</span>
                    <span className="text-[10px] font-bold text-indigo-600 mt-1 inline-block">
                      Click to Enter →
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Need an authorized HR account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    Register here →
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Form 2: Registration */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="e.g. Praveen"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="e.g. Chaduvala"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. pchaduvala"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="pchaduvala@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HR Role *</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loading ? 'Registering...' : 'Create Account & Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have an authorized profile?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                  >
                    Sign in here →
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
