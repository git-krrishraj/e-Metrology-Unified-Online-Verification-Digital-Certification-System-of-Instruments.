import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { Scale, LogIn, KeyRound, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectUser(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setError('');
    setLoading(true);
    try {
      const user = await quickLogin(roleKey);
      redirectUser(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'lmo' || role === 'gatc') navigate('/officer/dashboard');
    else navigate('/consumer/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left: Standard Login Form */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gov-600 flex items-center justify-center text-white">
                <Scale className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
                <p className="text-xs text-slate-500">National Legal Metrology Portal</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@metrology.gov.in"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-gov-600 hover:bg-gov-500 text-white font-semibold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <LogIn className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an instrument owner account?{' '}
            <Link to="/register" className="text-gov-600 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>

        {/* Right: 1-Click Evaluation / Demo Accounts */}
        <div className="bg-slate-900 p-6 sm:p-8 text-white flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Evaluation Quick-Login (1-Click)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select any stakeholder role to pre-authenticate instantly with pre-seeded data:
            </p>

            <div className="space-y-2.5">
              {Object.entries(DEMO_USERS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDemoLogin(key)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-gov-500 transition group flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-gold-400 transition">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            Legal Metrology Act, 2009 • Directorate of Legal Metrology, GoI
          </div>
        </div>
      </div>
    </div>
  );
};
