import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../services/api';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState('EMPLOYEE'); // 'ADMIN' or 'EMPLOYEE'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignup) {
      if (role === 'ADMIN') {
        setErrorMsg('Administrator accounts must be provisioned by an existing admin. Please register as an Employee.');
        return;
      }
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!identifier.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      if (password.length < 4) {
        setErrorMsg('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await apiPost('/auth/register', {
          name: name.trim(),
          email: identifier.trim(),
          password,
          role: 'EMPLOYEE',
        });
        setSuccessMsg('Employee account created successfully! You can now log in.');
        setIsSignup(false);
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setErrorMsg(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!identifier.trim() || !password) {
        setErrorMsg('Please provide both email/username and password.');
        return;
      }

      setLoading(true);
      try {
        const res = await apiPost('/auth/login', {
          email: identifier.trim(),
          password,
        });

        const userData = res.user || {
          email: identifier,
          role: role,
          name: identifier.split('@')[0],
        };
        const token = res.token || 'admin-secure-token-session-01';

        login(userData, token);

        if (userData.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/userUI');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Invalid credentials. Please verify your login details.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-10 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
            P
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 tracking-tight block">Patch Portal</span>
            <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider block">Enterprise Suite</span>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-xs">
          <Link to="/userUI" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
            User UI View
          </Link>
          <Link to="/admin" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
            Static Content
          </Link>
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </nav>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isSignup ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-500 mt-1.5">
              {isSignup
                ? 'Register your employee profile to access company documents.'
                : 'Sign in to access corporate documents and application patches.'}
            </p>
          </div>

          {/* Role Preference Pills */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 text-center">
              Select Login Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole('EMPLOYEE')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'EMPLOYEE'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'ADMIN'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>
            {isSignup && role === 'ADMIN' && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 text-center">
                Note: Public signups create Employee accounts only. Admin accounts require system administrator approval.
              </p>
            )}
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {isSignup && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shashvat Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isSignup ? 'Email Address' : 'Email or Username'}
              </label>
              <input
                type="text"
                placeholder="user@company.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                required
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignup && role === 'ADMIN')}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs tracking-wide shadow-md transition-all mt-2 ${
                loading || (isSignup && role === 'ADMIN')
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99]'
              }`}
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold block w-full"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>

            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium block w-full"
            >
              Terms and Conditions
            </button>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        © 2026 Patch Portal • Enterprise Version & Policy Management System
      </footer>

      {/* Terms and Conditions Dialog */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Terms and Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Please read these terms and conditions carefully before using our application. By accessing
              or using the service, you agree to be bound by these terms. This application provides version
              patch management, organizational static content distribution, and employee administrative
              services in accordance with enterprise policies.
            </p>
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
