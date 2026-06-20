import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  BookOpen, Users, FileText, ClipboardCheck,
  PlusCircle, Calendar, ChevronRight, TrendingUp
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

ChartJS.register(ArcElement, Tooltip, Legend);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const TeacherDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sr, cr, nr] = await Promise.all([
          api.get('/analytics/teacher'),
          api.get('/courses'),
          api.get('/notices'),
        ]);
        setStats(sr.data.data);
        setCourses(cr.data.data.slice(0, 6));
        setNotices(nr.data.data.slice(0, 3));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const graded = Math.max(0, (stats?.totalAssignments || 5) * 8 - (stats?.pendingGrading || 10));
  const pending = stats?.pendingGrading || 10;

  const chartData = {
    labels: ['Graded', 'Pending'],
    datasets: [{
      data: [graded, pending],
      backgroundColor: ['#4f46e5', '#f1f5f9'],
      borderColor: ['#4f46e5', '#e2e8f0'],
      borderWidth: 1.5,
      hoverOffset: 6,
    }]
  };

  const stats4 = [
    { label: 'Courses Teaching', value: stats?.coursesCount || 0, sub: 'This semester', icon: BookOpen, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { label: 'Total Students', value: stats?.totalStudents || 0, sub: 'Across all classes', icon: Users, iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { label: 'Tasks Published', value: stats?.totalAssignments || 0, sub: 'Active assignments', icon: FileText, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Pending Grading', value: stats?.pendingGrading || 0, sub: 'Action required', icon: ClipboardCheck, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-5 bg-gradient-to-br from-sky-600 to-indigo-700 border-0 text-white">
        <p className="text-sky-200 text-sm font-medium">Good {getGreeting()},</p>
        <h1 className="text-2xl font-bold mt-0.5">{user?.name || 'Teacher'} 👋</h1>
        <p className="text-sky-200 text-sm mt-1">You have {stats?.pendingGrading || 0} submissions awaiting grading today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats4.map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 leading-none ${s.label === 'Pending Grading' ? 'text-red-500' : 'text-slate-900'}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
            <div className={`icon-box ${s.iconBg}`}>
              <s.icon className={`h-5 w-5 ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Course List */}
        <div className="card p-5 lg:col-span-2">
          <div className="section-header">
            <div>
              <h3 className="section-title">My Courses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Courses you are instructing this term</p>
            </div>
            <Link to="/courses" className="btn-primary btn-sm">
              <PlusCircle className="h-3.5 w-3.5" /> New Course
            </Link>
          </div>
          <div className="space-y-2">
            {courses.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No courses assigned.</p>
            ) : courses.map(c => (
              <div key={c._id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-indigo-50 h-9 w-9 rounded-lg">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <span className="badge-blue text-[9px] mb-0.5">{c.code}</span>
                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.creditHours} Credit Hours · {c.category}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="card p-5 flex flex-col">
          <div className="section-header">
            <h3 className="section-title">Submission Status</h3>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex-1 flex items-center justify-center py-4" style={{ minHeight: 200 }}>
            <Doughnut
              data={chartData}
              options={{
                responsive: true, maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', font: { size: 11 }, boxWidth: 12, padding: 16 }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Notices */}
      <div className="card p-5">
        <div className="section-header">
          <h3 className="section-title">Recent Notices</h3>
          <Link to="/notices" className="text-xs text-indigo-600 font-semibold flex items-center gap-0.5 hover:underline">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {notices.map(n => (
            <div key={n._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge-blue text-[9px]">{n.postedBy?.role}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{n.title}</p>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
