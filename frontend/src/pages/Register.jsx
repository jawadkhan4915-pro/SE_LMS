import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice';
import api from '../utils/api';
import { GraduationCap, Mail, Lock, User, Phone, AlertCircle, ChevronRight, Sparkles, Crown } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('SE');
  const [departments, setDepartments] = useState([]);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    api.get('/departments')
      .then(res => {
        setDepartments(res.data.data);
        if (res.data.data.length > 0) {
          setDepartment(res.data.data[0].code);
        }
      })
      .catch(err => {
        console.error('Failed to load departments in Register:', err);
        setDepartments([
          { code: 'SE', name: 'Software Engineering' },
          { code: 'CS', name: 'Computer Science' },
          { code: 'IT', name: 'Information Technology' },
          { code: 'EE', name: 'Electrical Engineering' }
        ]);
      });
  }, []);

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
        section: role === 'student' ? section : undefined,
        department: role !== 'admin' ? department : undefined
      });
      dispatch(authSuccess(r.data.data));
      navigate('/dashboard');
    } catch (e) {
      dispatch(authFailure(e.response?.data?.message || 'Registration failed. Try again.'));
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
        
        {/* Left Brand Panel */}
        <div className="hidden lg:flex w-[40%] relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border-r border-amber-500/20 flex-col justify-between p-12 text-white">
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

            <h2 className="text-3xl font-black leading-tight mb-4">
              Join the Academic<br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                Oxford Portal
              </span>
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Create your account to access courses, live lectures, assignments, quizzes, timetables, and AI study tools.
            </p>
          </div>

          <div className="relative z-10 space-y-2.5 pt-6 border-t border-slate-800">
            {['Access all course materials & code repos', 'Real-time attendance & sessional matrix', 'Automated submission & quiz grading', 'Verified digital student virtual card'].map(f => (
              <div key={f} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
                <div className="h-5 w-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                </div>
                <span>{f}</span>
              </div>
            ))}
            <p className="text-slate-500 text-xs mt-4">© {new Date().getFullYear()} Software Engineering Department LMS</p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 my-auto">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 font-bold">
                  <GraduationCap className="h-6 w-6 text-slate-950" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white">SE-LMS</h1>
                  <p className="text-amber-400 text-xs font-semibold">Oxford Portal</p>
                </div>
              </div>

              <h2 className="text-2xl font-black text-white">Create Your Account</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Register as student, faculty, HOD, or administrator</p>
            </div>

            {/* Error Alert */}
            {(localError || error) && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{localError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="John Doe" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="email" placeholder="name@university.edu" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="password" placeholder="Min 6 characters" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Phone (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="+92 300 1234567" className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Role</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 cursor-pointer" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="hod">Head of Department</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {role !== 'admin' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Department</label>
                    <select className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 cursor-pointer" value={department} onChange={e => setDepartment(e.target.value)}>
                      {departments.map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {role === 'student' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Semester</label>
                      <select className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 cursor-pointer" value={semester} onChange={e => setSemester(e.target.value)}>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">Section</label>
                      <select className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 cursor-pointer" value={section} onChange={e => setSection(e.target.value)}>
                        {['A', 'B', 'C'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
                {loading ? (
                  <><span className="h-4 w-4 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />Creating account...</>
                ) : (
                  <><span>Register Account</span><ChevronRight className="h-4 w-4 text-slate-950" /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-amber-400 hover:text-amber-300">Sign in</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
