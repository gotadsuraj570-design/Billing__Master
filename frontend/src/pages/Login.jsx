import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReceiptText, Lock, Mail, AlertCircle } from 'lucide-react';
import Spinner from '../components/Spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand info column (hidden on mobile) */}
      <div className="relative hidden w-1/2 bg-slate-900 lg:flex flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-650/20">
            <ReceiptText className="w-8 h-8 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider uppercase">BillingMaster</span>
        </div>

        <div className="space-y-6 max-w-md my-auto">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Seamless Inventory & Billing Management.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage your inventory, generate invoices, track customers, and analyze revenues in one unified dashboard.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} BillingMaster. Designed for efficiency.
        </div>
      </div>

      {/* Login form column */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-12 md:px-24 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-indigo-600 text-white">
                <ReceiptText className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold">BillingMaster</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Sign In</h3>
            <p className="text-slate-500 font-medium">
              Access your dashboard. New here?{' '}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 focus:ring-3 focus:ring-indigo-600/10 transition-all outline-none text-slate-800"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 focus:ring-3 focus:ring-indigo-600/10 transition-all outline-none text-slate-800"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-lg active:scale-99 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="white" />
                  <span>Logging in...</span>
                </div>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <hr className="flex-1 border-slate-200" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          {/* Sign Up Button */}
          <Link
            to="/signup"
            className="flex items-center justify-center w-full py-3 px-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-100 hover:border-slate-300 active:scale-99 transition-all"
          >
            Create a New Account
          </Link>

          {/* Credentials info helper card */}
          <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Demo Credentials</h4>
            <div className="space-y-1 text-xs text-slate-500">
              <p>Email: <span className="font-semibold text-indigo-600 select-all">admin@example.com</span></p>
              <p>Password: <span className="font-semibold text-indigo-600 select-all">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
