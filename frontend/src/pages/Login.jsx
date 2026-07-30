import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import api from '../utils/api';
import { GraduationCap, Mail, Lock, AlertCircle, ChevronRight, Sparkles, Crown } from 'lucide-react';

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
  CS_IT: [
    { role: 'Student', name: 'Tim Student', email: 'it_student@lms.edu', pass: 'password123', color: 'indigo', icon: '🎓' },
    { role: 'Teacher', name: 'Dr. Tim Berners-Lee', email: 'it_teacher@lms.edu', pass: 'password123', color: 'sky', icon: '📚' },
    { role: 'HOD', name: 'IT HOD', email: 'it_hod@lms.edu', pass: 'password123', color: 'emerald', icon: '🏛️' },
    { role: 'Admin', name: 'IT Admin', email: 'it_admin@lms.edu', pass: 'password123', color: 'amber', icon: '⚙️' },
  ],
  Admin: [
    { role: 'Univ Admin', name: 'Demo Admin', email: 'admin@lms.edu', pass: 'password123', color: 'amber', icon: '🛡️' },
    { role: 'Univ Exam', name: 'Univ Exam Coord', email: 'uni_coordinator@lms.edu', pass: 'password123', color: 'purple', icon: '⚖️' },
    { role: 'Accountant', name: 'Demo Accountant', email: 'accountant@lms.edu', pass: 'password123', color: 'teal', icon: '💰' },
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
    <div className="min-h-screen relative bg-slate-950 text-slate-100 flex items-center justify-center overflow-hidden">
      
      {/* Background Oxford Image with Vignette Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/oxford_university.png"
          alt="Oxford University Radcliffe Camera"
          className="w-full h-full object-cover object-center scale-105 filter blur-xs brightness-[0.3] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/90 to-slate-950/80" />
      </div>

      <div className="relative z-10 w-full min-h-screen flex">
        
        {/* Left Panel — Brand Showcase */}
        <div className="hidden lg:flex w-[42%] relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border-r border-amber-500/20 flex-col justify-between p-12 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-12 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 shadow-lg shadow-amber-500/20 border border-amber-300/30">
                <GraduationCap className="h-7 w-7 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black tracking-tight text-white">SE-LMS</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <Crown className="w-3 h-3 inline text-amber-400 mr-0.5" /> Oxford Portal
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium">Software Engineering Dept.</p>
              </div>
            </Link>

            <h2 className="text-4xl font-black leading-tight mb-4">
              Software Engineering<br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                Department LMS
              </span>
            </h2>

            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Unified digital workspace for students, faculty, HODs, coordinators, and administrators with Oxford academic distinction.
            </p>
          </div>

          {/* Feature Points */}
          <div className="relative z-10 space-y-3 pt-6 border-t border-slate-800">
            {['AI-powered course assistant & coding solver', 'Real-time attendance & sessional matrix', 'Digital Virtual ID with QR authentication', 'Distraction-free live online lecture rooms'].map(feat => (
              <div key={feat} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                <div className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
            <p className="text-slate-500 text-xs mt-6">© {new Date().getFullYear()} Software Engineering Department LMS</p>
          </div>
        </div>

        {/* Right Panel — Luxury Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold">
                  <GraduationCap className="h-6 w-6 text-slate-950" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white">SE-LMS</h1>
                  <p className="text-amber-400 text-xs font-semibold">Oxford Department Portal</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white">Welcome Back</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Sign in to your academic portal</p>
            </div>

            {/* Error Alert */}
            {(localError || error) && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@university.edu"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-0">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {loading ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />Signing in...</>
                ) : (
                  <><span>Sign In to Portal</span><ChevronRight className="h-4 w-4 text-slate-950" /></>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="pt-5 border-t border-slate-800">
              <p className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider mb-3 text-center">
                Quick Demo — Click to Auto-Fill
              </p>

              {/* Department Tabs */}
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {Object.keys(demoDepartments).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setActiveDept(dept)}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all border ${
                      activeDept === dept
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              {/* Demo Accounts Grid */}
              <div className="grid grid-cols-2 gap-2">
                {demoDepartments[activeDept]?.map((d) => (
                  <button
                    key={d.email}
                    id={`demo-${activeDept.toLowerCase()}-${d.role.toLowerCase()}`}
                    type="button"
                    onClick={() => { setEmail(d.email); setPassword(d.pass); }}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 text-left transition-all cursor-pointer group"
                  >
                    <span className="text-lg mt-0.5 leading-none">{d.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white group-hover:text-amber-300">{d.role}</p>
                        <span className="text-[8px] bg-slate-800 text-slate-300 px-1 rounded font-semibold uppercase">
                          {activeDept}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 truncate" title={d.name}>
                        {d.name}
                      </p>
                      <p className="text-[9px] text-amber-400/80 truncate">pw: password123</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-slate-400">
              New student?{' '}
              <Link to="/register" className="font-extrabold text-amber-400 hover:text-amber-300">
                Register here
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
