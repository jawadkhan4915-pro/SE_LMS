import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSelector } from 'react-redux';
import { 
  FileText, Calendar, Plus, Trash2, Lock, Unlock, Search, ShieldAlert,
  GraduationCap, ClipboardList, CheckCircle, Clock, Building, UserCheck
} from 'lucide-react';
import { getDepartmentFullName } from '../utils/departmentHelper';

const CoordinatorDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' or 'students'
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for new exam schedule
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [examRoom, setExamRoom] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const scheduleRes = await api.get('/exams/schedules');
      setSchedules(scheduleRes.data.data);

      const studentRes = await api.get('/exams/students');
      setStudents(studentRes.data.data);

      const courseRes = await api.get('/courses/all');
      setCourses(courseRes.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch coordinator dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !examType || !examDate || !examTime || !examRoom) return;

    setFormSubmitting(true);
    try {
      const payload = {
        courseId: selectedCourse,
        type: examType,
        date: examDate,
        time: examTime,
        room: examRoom,
        department: user.department // Send if coordinator, otherwise backend will copy course dept
      };
      await api.post('/exams/schedules', payload);
      
      // Reset form
      setSelectedCourse('');
      setExamDate('');
      setExamTime('');
      setExamRoom('');
      
      // Refresh list
      const scheduleRes = await api.get('/exams/schedules');
      setSchedules(scheduleRes.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create exam schedule');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      await api.delete(`/exams/schedules/${scheduleId}`);
      setSchedules(schedules.filter(s => s._id !== scheduleId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete schedule');
    }
  };

  const handleToggleOverride = async (studentId, currentOverride) => {
    try {
      await api.post('/exams/override-slip', { studentId, override: !currentOverride });
      
      // Update local state
      setStudents(students.map(s => {
        if (s._id === studentId) {
          const newOverride = !currentOverride;
          // Dynamically compute the locking status for demo
          // (if override is true, then isLocked becomes false)
          return { 
            ...s, 
            examSlipOverride: newOverride,
            isLocked: newOverride ? false : s.isLocked 
          };
        }
        return s;
      }));
      
      // Refresh database records to be 100% synced with backend checks
      const studentRes = await api.get('/exams/students');
      setStudents(studentRes.data.data);
    } catch (err) {
      console.error(err);
      alert('Failed to override slip status');
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute metrics
  const totalStudents = students.length;
  const lockedSlipsCount = students.filter(s => s.isLocked).length;
  const overriddenSlipsCount = students.filter(s => s.examSlipOverride).length;
  const scheduledExamsCount = schedules.length;

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const deptName = user?.department ? `${getDepartmentFullName(user.department)} Department` : 'University Exam Department';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="card p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 border-0 text-white rounded-2xl shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-purple-200" />
          <p className="text-purple-200 text-xs font-bold uppercase tracking-wider">Exam Controller Portal</p>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome, {user?.name || 'Coordinator'}</h1>
        <p className="text-indigo-100 text-sm mt-1 font-medium">{deptName} · Manage exam dates and roll number slip locks</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalStudents}</p>
          </div>
          <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>
        
        <div className="stat-card p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Locked Slips</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{lockedSlipsCount}</p>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Manual Overrides</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{overriddenSlipsCount}</p>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Scheduled Exams</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{scheduledExamsCount}</p>
          </div>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === 'schedules'
              ? 'border-purple-600 text-purple-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Manage Exam Timetable
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === 'students'
              ? 'border-purple-600 text-purple-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Slip Lock & Fee Overrides
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'schedules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Scheduling form */}
          <div className="card p-5 bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Schedule New Exam</h3>
            
            <form onSubmit={handleAddSchedule} className="space-y-3">
              <div>
                <label className="form-label text-slate-500 font-semibold mb-1 block">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  className="form-input text-xs"
                >
                  <option value="">Select Course...</option>
                  {courses
                    .filter(c => !user?.department || c.department === user.department)
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="form-label text-slate-500 font-semibold mb-1 block">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    required
                    className="form-input text-xs animate-none"
                  >
                    <option value="midterm">Midterm</option>
                    <option value="finalterm">Finalterm</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-slate-500 font-semibold mb-1 block">Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 101"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    required
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-slate-500 font-semibold mb-1 block">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-slate-500 font-semibold mb-1 block">Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 09:00 AM - 12:00 PM"
                  value={examTime}
                  onChange={(e) => setExamTime(e.target.value)}
                  required
                  className="form-input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-4"
              >
                <Plus className="h-4 w-4" />
                <span>Create Exam Slot</span>
              </button>
            </form>
          </div>

          {/* Schedules Table */}
          <div className="card bg-white border border-slate-200 rounded-2xl shadow-sm lg:col-span-2 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Schedules List</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-150 text-indigo-600 uppercase">
                {schedules.length} slots
              </span>
            </div>
            
            {schedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="px-5 py-3">Course</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Time & Room</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((s) => (
                      <tr key={s._id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-800">{s.course?.name}</p>
                          <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500 font-mono font-semibold">{s.course?.code}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.type === 'midterm' ? 'bg-amber-50 text-amber-600 border border-amber-250' : 'bg-rose-50 text-rose-600 border border-rose-250'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          {new Date(s.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-800">{s.time}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Building className="h-3 w-3" />
                            <span>{s.room}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteSchedule(s._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors inline-block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">No exam schedules created yet. Add one from the left panel.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header Search controls */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10 text-xs py-1.5"
              />
            </div>
            
            <p className="text-xs text-slate-400 font-medium">
              Showing {filteredStudents.length} of {totalStudents} students
            </p>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Semester & Contact</th>
                    <th className="px-5 py-3">Fee Voucher Status</th>
                    <th className="px-5 py-3">Roll No Slip Lock</th>
                    <th className="px-5 py-3 text-right">Manual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{student.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-700">Semester {student.semester}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{student.phone || 'No phone'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          student.feeSummary.includes('Paid')
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : student.feeSummary.includes('Installment')
                            ? 'bg-amber-50 text-amber-600 border border-amber-250'
                            : 'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {student.feeSummary}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {student.isLocked ? (
                          <span className="text-rose-500 font-bold flex items-center gap-1 text-[11px]">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        ) : (
                          <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                            <Unlock className="h-3 w-3" /> Unlocked
                            {student.examSlipOverride && (
                              <span className="text-[8px] uppercase tracking-wide bg-amber-100 border border-amber-200 text-amber-700 px-1 rounded-sm ml-1 font-extrabold animate-pulse">
                                Overridden
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleToggleOverride(student._id, student.examSlipOverride)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shadow-sm ${
                            student.examSlipOverride
                              ? 'bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {student.examSlipOverride ? 'Reset Lock Policy' : 'Force Bypass Lock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">No students matching your search criteria.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoordinatorDashboard;
