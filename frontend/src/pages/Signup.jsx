import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReceiptText, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import api from '../services/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- Client-side Validations ---
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the backend register API
      const response = await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      const { token, user } = response.data;

      // Store token & user in localStorage (same as login)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect straight to the dashboard
      navigate('/dashboard');
      // Reload to let AuthContext pick up the new session
      window.location.href = '/dashboard';

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Brand column (hidden on mobile) */}
      <div className="relative hidden w-1/2 bg-slate-900 lg:flex flex-col justify-between p-12 text-white overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <ReceiptText className="w-8 h-8 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider uppercase">BillingMaster</span>
        </div>

        {/* Headline */}
        <div className="relative space-y-5 max-w-md my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300">Free to get started</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Set up your store in minutes.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Create an account to manage your entire inventory, generate invoices, and track customer purchases — all from one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-3 pt-2">
            {[
              'Full product inventory management',
              'One-click invoice generation',
              'Automatic stock level tracking',
              'Customer purchase history'
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-indigo-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-sm text-slate-500">
          &copy; {new Date().getFullYear()} BillingMaster. All rights reserved.
        </div>
      </div>

      {/* Sign Up form column */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-12 md:px-24 bg-white overflow-y-auto py-10">
        <div className="w-full max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <ReceiptText className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold">BillingMaster</span>
          </div>

          {/* Page heading */}
          <div className="space-y-2 mb-8">
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h3>
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rahul Sharma"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-600/10 outline-none transition-all text-slate-800"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-600/10 outline-none transition-all text-slate-800"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Password <span className="normal-case text-slate-400 font-normal">(min. 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-600/10 outline-none transition-all text-slate-800"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="signup-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-3 outline-none transition-all text-slate-800 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-600/10'
                      : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-600/10'
                  }`}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {/* Real-time password match feedback */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-500 font-semibold mt-1">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-lg active:scale-99 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="white" />
                  <span>Creating account...</span>
                </div>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-slate-400">
            By signing up, you agree that this is a demo application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
