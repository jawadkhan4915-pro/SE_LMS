import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import api from '../utils/api';
import { GraduationCap, Mail, Lock, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

const demoDepartments = {
  SE: [
    { role: 'Student', name: 'Demo Student', email: 'student@lms.edu', pass: 'password123', color: 'indigo', icon: '🎓' },
    { role: 'Teacher', name: 'Prof. Sarah Connor', email: 'teacher@lms.edu', pass: 'password123', color: 'sky', icon: '📚' },
    { role: 'HOD', name: 'Demo HOD', email: 'hod@lms.edu', pass: 'password123', color: 'emerald', icon: '🏛️' },
    { role: 'Admin', name: 'SE Admin', email: 'se_admin@lms.edu', pass: 'password123', color: 'amber', icon: '⚙️' },
    { role: 'Coordinator', name: 'SE Exam Coord', email: 'se_coordinator@lms.edu', pass: 'password123', color: 'purple', icon: '📝' },
  ],
  CS: [
    { role: 'Student', name: 'Grace Student', email: 'cs_student@lms.edu', pass: 'password123', color: 'indigo', icon: '🎓' },
    { role: 'Teacher', name: 'Dr. Grace Hopper', email: 'cs_teacher@lms.edu', pass: 'password123', color: 'sky', icon: '📚' },
    { role: 'HOD', name: 'CS HOD', email: 'cs_hod@lms.edu', pass: 'password123', color: 'emerald', icon: '🏛️' },
    { role: 'Admin', name: 'CS Admin', email: 'cs_admin@lms.edu', pass: 'password123', color: 'amber', icon: '⚙️' },
    { role: 'Coordinator', name: 'CS Exam Coord', email: 'cs_coordinator@lms.edu', pass: 'password123', color: 'purple', icon: '📝' },
  ],
  IT: [
    { role: 'Student', name: 'Tim Student', email: 'it_student@lms.edu', pass: 'password123', color: 'indigo', icon: '🎓' },
    { role: 'Teacher', name: 'Dr. Tim Berners-Lee', email: 'it_teacher@lms.edu', pass: 'password123', color: 'sky', icon: '📚' },
    { role: 'HOD', name: 'IT HOD', email: 'it_hod@lms.edu', pass: 'password123', color: 'emerald', icon: '🏛️' },
    { role: 'Admin', name: 'IT Admin', email: 'it_admin@lms.edu', pass: 'password123', color: 'amber', icon: '⚙️' },
    { role: 'Coordinator', name: 'IT Exam Coord', email: 'it_coordinator@lms.edu', pass: 'password123', color: 'purple', icon: '📝' },
  ],
  EE: [
    { role: 'Student', name: 'Nikola Student', email: 'ee_student@lms.edu', pass: 'password123', color: 'indigo', icon: '🎓' },
    { role: 'Teacher', name: 'Dr. Nikola Tesla', email: 'ee_teacher@lms.edu', pass: 'password123', color: 'sky', icon: '📚' },
    { role: 'HOD', name: 'EE HOD', email: 'ee_hod@lms.edu', pass: 'password123', color: 'emerald', icon: '🏛️' },
    { role: 'Admin', name: 'EE Admin', email: 'ee_admin@lms.edu', pass: 'password123', color: 'amber', icon: '⚙️' },
    { role: 'Coordinator', name: 'EE Exam Coord', email: 'ee_coordinator@lms.edu', pass: 'password123', color: 'purple', icon: '📝' },
  ],
  Admin: [
    { role: 'Univ Admin', name: 'Demo Admin', email: 'admin@lms.edu', pass: 'password123', color: 'amber', icon: '🛡️' },
    { role: 'Univ Exam', name: 'Univ Exam Coord', email: 'uni_coordinator@lms.edu', pass: 'password123', color: 'purple', icon: '⚖️' },
  ]
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [activeDept, setActiveDept] = useState('SE');

  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) { setLocalError('Please fill in all fields'); return; }
    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', { email, password });
      dispatch(authSuccess(response.data.data));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      dispatch(authFailure(msg));
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12 text-white">
        {/* Abstract circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-900/40 rounded-full -mr-20 -mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Uni-LMS</h1>
              <p className="text-indigo-300 text-xs font-medium">University Portal</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-4">
            University Learning<br />Management System
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
            A unified digital platform for students, faculty, and administration to manage academics efficiently.
          </p>
        </div>

        {/* Feature points */}
        <div className="relative z-10 space-y-3">
          {['AI-powered course management', 'Real-time attendance tracking', 'Smart analytics & grading', 'Seamless assignment workflows'].map(feat => (
            <div key={feat} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-sm text-indigo-100">{feat}</span>
            </div>
          ))}
          <p className="text-indigo-300 text-xs mt-6">© 2026 University LMS</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Uni-LMS</h1>
              <p className="text-slate-500 text-xs">University Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-7">Sign in to access your academic portal</p>

          {/* Error Alert */}
          {(localError || error) && (
            <div className="alert-error mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@university.edu"
                  className="form-input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="form-input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
            >
              {loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Signing in...</>
              ) : (
                <><span>Sign In</span><ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3.5 text-center">
              Quick Demo — Click to Auto-Fill
            </p>

            {/* Department Tabs */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {Object.keys(demoDepartments).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setActiveDept(dept)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                    activeDept === dept
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Department-specific Demo Accounts Grid */}
            <div className="grid grid-cols-2 gap-2">
              {demoDepartments[activeDept].map((d) => (
                <button
                  key={d.email}
                  id={`demo-${activeDept.toLowerCase()}-${d.role.toLowerCase()}`}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                  className="demo-pill flex items-start gap-2.5 p-2.5"
                >
                  <span className="text-xl mt-0.5 leading-none">{d.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800">{d.role}</p>
                      <span className="text-[8px] bg-slate-200 text-slate-600 px-1 rounded font-semibold uppercase">
                        {activeDept}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 truncate" title={d.name}>
                      {d.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{d.email}</p>
                    <p className="text-[9px] font-semibold text-indigo-600/90 mt-0.5">pw: password123</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            New student?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
