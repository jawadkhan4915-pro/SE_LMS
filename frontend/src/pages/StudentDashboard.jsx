import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  BookOpen, Calendar, FileText, Award,
  ArrowUpRight, TrendingUp, Clock, Bell, ChevronRight,
  Trophy, Flame, Target, Star, Zap
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
  <div className="stat-card">
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
    <div className={`icon-box ${iconBg}`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [notices, setNotices] = useState([]);
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sr, nr, xr] = await Promise.all([
          api.get('/analytics/student'),
          api.get('/notices'),
          api.get('/users/profile/xp-badges')
        ]);
        setStats(sr.data.data);
        setNotices(nr.data.data.slice(0, 4));
        setXpData(xr.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const getBadgeIcon = (iconType) => {
    switch (iconType) {
      case 'cup': return <Trophy className="h-4.5 w-4.5 text-indigo-650" />;
      case 'fire': return <Flame className="h-4.5 w-4.5 text-orange-500 animate-pulse" />;
      case 'target': return <Target className="h-4.5 w-4.5 text-red-500" />;
      case 'star': return <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />;
      default: return <Award className="h-4.5 w-4.5 text-indigo-500" />;
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const chartData = {
    labels: stats?.courses?.map(c => c.code) || ['ML', 'DL', 'CV', 'NLP', 'SE'],
    datasets: [{
      label: 'Attendance %',
      data: stats?.courses?.map(() => 75 + Math.round(Math.random() * 20)) || [90, 88, 92, 78, 85],
      backgroundColor: '#6366f1',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, max: 100, min: 0 },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Gamified Level Header */}
      <div className="card p-6 bg-gradient-to-br from-indigo-900 to-indigo-950 border-0 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Good {getGreeting()},</p>
            <h1 className="text-2xl font-black">{user?.name || 'Student'} 👋</h1>
            <p className="text-indigo-200 text-xs leading-relaxed max-w-md">Keep track of lessons, complete activities to gain XP and unlock custom academic achievements.</p>
          </div>
          
          {/* XP & Level Indicator */}
          {xpData && (
            <div className="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold flex items-center gap-1">
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                  Level {xpData.currentLevel}
                </span>
                <span className="text-[10px] text-indigo-200 font-semibold">{xpData.xpInCurrentLevel} / 500 XP</span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-700"
                  style={{ width: `${(xpData.xpInCurrentLevel / 500) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-indigo-200 text-right">Need {xpData.xpToNextLevel} XP to level up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cumulative GPA" value={stats?.gpa || '3.50'} sub="Out of 4.00" icon={Award} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
        <StatCard label="Courses Enrolled" value={stats?.enrolledCoursesCount || 0} sub="Active this semester" icon={BookOpen} iconBg="bg-sky-50" iconColor="text-sky-600" />
        <StatCard label="Attendance Rate" value={`${stats?.attendance || 100}%`} sub="Min. required: 75%" icon={Calendar} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <StatCard label="Pending Tasks" value={stats?.pendingAssignments || 0} sub="Due this week" icon={FileText} iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="section-header">
            <div>
              <h3 className="section-title">Attendance by Course</h3>
              <p className="text-xs text-slate-400 mt-0.5">Current semester performance</p>
            </div>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="h-56">
            <Bar data={chartData} options={chartOpts} />
          </div>
        </div>

        {/* Notices & Achievements Side Panel */}
        <div className="flex flex-col gap-5">
          {/* Notices */}
          <div className="card p-5 flex-1">
            <div className="section-header">
              <h3 className="section-title">Notice Board</h3>
              <Link to="/notices" className="text-xs text-indigo-650 font-semibold hover:underline flex items-center gap-0.5">
                All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {notices.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No recent notices</p>
              ) : notices.map(n => (
                <div key={n._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-250 transition-colors">
                  <span className="badge-blue text-[9px] mb-1">{n.postedBy?.role || 'Admin'}</span>
                  <p className="text-sm font-semibold text-slate-850 mt-1 line-clamp-1">{n.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Badges / Achievements */}
          {xpData && (
            <div className="card p-5">
              <div className="section-header">
                <h3 className="section-title">Academic Badges</h3>
                <span className="badge-blue text-[9px] font-bold">{xpData.badges?.length || 0} unlocked</span>
              </div>
              <div className="space-y-3">
                {(!xpData.badges || xpData.badges.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-6">Submit tasks & quizzes to earn badges!</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    {xpData.badges.map((badge) => (
                      <div key={badge._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 card-hover">
                        <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          {getBadgeIcon(badge.iconType)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{badge.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="card p-5">
        <div className="section-header">
          <div>
            <h3 className="section-title">Enrolled Courses</h3>
            <p className="text-xs text-slate-400 mt-0.5">{stats?.courses?.length || 0} courses this semester</p>
          </div>
          <Link to="/courses" className="btn-secondary btn-sm">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats?.courses?.map(c => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all card-hover">
              <div>
                <span className="badge-blue text-[9px] mb-1">{c.code}</span>
                <p className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">{c.name}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">Grade: {c.grade || 'N/A'}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

export default StudentDashboard;
