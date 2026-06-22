import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import api from '../utils/api';
import { GraduationCap, Mail, Lock, User, Phone, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');

  const { loading, error } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!name || !email || !password) { setLocalError('Please fill in all required fields'); return; }
    dispatch(authStart());
    try {
      const r = await api.post('/auth/register', {
        name, email, password, role, phone,
        semester: role === 'student' ? Number(semester) : undefined,
        section: role === 'student' ? section : undefined
      });
      dispatch(authSuccess(r.data.data));
      navigate('/dashboard');
    } catch (e) {
      dispatch(authFailure(e.response?.data?.message || 'Registration failed. Try again.'));
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex w-[40%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col justify-between p-12 text-white">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-900/40 rounded-full -mr-20 -mb-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SE-LMS</h1>
              <p className="text-indigo-300 text-xs font-medium">Software Engineering Dept</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">Join the SE Department<br />Academic Platform</h2>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
            Create your account to access courses, assignments, quizzes, and academic resources.
          </p>
        </div>

        <div className="relative z-10 space-y-2">
          {['Access all course materials', 'Track attendance in real-time', 'Submit & grade assignments', 'View analytics & GPA'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="text-sm text-indigo-100">{f}</span>
            </div>
          ))}
          <p className="text-indigo-300 text-xs mt-4">© 2026 SE Department · University LMS</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8 animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">SE-LMS</h1>
              <p className="text-slate-500 text-xs">Software Engineering Dept</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm mb-7">Register as student, teacher, or administrator</p>

          {(localError || error) && (
            <div className="alert-error mb-5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="John Doe" className="form-input pl-10" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="form-label">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="email" placeholder="name@university.edu" className="form-input pl-10" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="form-label">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="password" placeholder="Min 6 characters" className="form-input pl-10" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="form-label">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" placeholder="+92 300 1234567" className="form-input pl-10" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="hod">Head of Department</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {role === 'student' && (
                <>
                  <div>
                    <label className="form-label">Semester</label>
                    <select className="form-select" value={semester} onChange={e => setSemester(e.target.value)}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Section</label>
                    <select className="form-select" value={section} onChange={e => setSection(e.target.value)}>
                      {['A', 'B', 'C'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating account...</>
              ) : (
                <><span>Create Account</span><ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
