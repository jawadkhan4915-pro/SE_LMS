import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { GraduationCap, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess('Password updated successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset token is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '-4s' }}></div>

      <div className="w-full max-w-md glass-card p-8 neon-glow relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-lg shadow-teal-500/20 mb-4">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            Set New Password
          </h2>
          <p className="text-xs text-slate-400 mt-1">Please type a new password for your account</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-6">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="flex flex-col items-center gap-3 px-4 py-6 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <CheckCircle className="h-10 w-10 text-teal-400 animate-bounce mb-2" />
              <p className="font-bold text-sm">{success}</p>
              <p className="text-xs text-slate-300">Redirecting to login portal in 3 seconds...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all duration-200"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/10 transition-all duration-150"
            >
              {loading ? 'Updating Password...' : 'Save Password'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
