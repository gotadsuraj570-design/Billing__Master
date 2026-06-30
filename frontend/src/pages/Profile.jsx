import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  // Field states
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Input Validations
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      const result = await updateProfile(name.trim(), password);
      if (result.success) {
        setSuccess('Profile updated successfully!');
        // Clear password fields
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <User className="w-5 h-5 text-indigo-650" />
          <h3 className="text-lg font-bold text-slate-800">Profile Settings</h3>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-3 p-4 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Profile Info Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Administrator"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-650 focus:ring-3 focus:ring-indigo-600/10 outline-none text-sm font-medium"
                required
                disabled={loading}
              />
            </div>

            {/* Read-only Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email Address (Cannot be changed)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-sm font-medium cursor-not-allowed"
                disabled
              />
            </div>

            <hr className="border-slate-100 my-2" />

            {/* Change Password Block */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-450" />
                <h4 className="text-sm font-extrabold text-slate-700">Change Password</h4>
              </div>
              <p className="text-xs text-slate-400">Leave these fields blank if you do not wish to change your password.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-655 outline-none text-sm font-medium"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl font-bold shadow-md shadow-indigo-650/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="white" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
