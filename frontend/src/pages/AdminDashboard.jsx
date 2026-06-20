import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  Users, BookOpen, FileText, FolderOpen,
  UserCheck, Megaphone, ArrowUpRight, TrendingUp, Shield
} from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/admin')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const pieData = {
    labels: ['Students', 'Teachers', 'HODs', 'Admins'],
    datasets: [{
      data: [
        stats?.users?.students || 0,
        stats?.users?.teachers || 0,
        stats?.users?.hods || 0,
        stats?.users?.admins || 0,
      ],
      backgroundColor: ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'],
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    }]
  };

  const statCards = [
    { label: 'Total Accounts', value: stats?.users?.total || 0, sub: 'Registered users', icon: Users, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { label: 'Active Courses', value: stats?.totalCourses || 0, sub: 'Course catalog', icon: BookOpen, iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { label: 'Shared Resources', value: stats?.totalResources || 0, sub: 'Library files', icon: FolderOpen, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Assignments', value: stats?.totalAssignments || 0, sub: 'Across all courses', icon: FileText, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  const quickActions = [
    { to: '/admin/users', label: 'Manage Users', desc: 'Create, edit & manage accounts', icon: UserCheck, color: 'indigo' },
    { to: '/admin/courses', label: 'Manage Courses', desc: 'Add modules & assign faculty', icon: BookOpen, color: 'sky' },
    { to: '/notices', label: 'Broadcast Notice', desc: 'Post department announcements', icon: Megaphone, color: 'amber' },
    { to: '/resources', label: 'Resource Library', desc: 'Upload and manage materials', icon: FolderOpen, color: 'emerald' },
  ];

  const colorMap = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', hover: 'hover:border-indigo-300' },
    sky: { bg: 'bg-sky-50', icon: 'text-sky-600', hover: 'hover:border-sky-300' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', hover: 'hover:border-amber-300' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', hover: 'hover:border-emerald-300' },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-5 bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white">
        <div className="flex items-center gap-2 mb-0.5">
          <Shield className="h-4 w-4 text-amber-200" />
          <p className="text-amber-200 text-sm font-medium">Administrator</p>
        </div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Admin'} 👋</h1>
        <p className="text-amber-100 text-sm mt-1">System is healthy · {stats?.users?.total || 0} accounts registered</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
            </div>
            <div className={`icon-box ${s.iconBg}`}>
              <s.icon className={`h-5 w-5 ${s.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="card p-5 lg:col-span-2">
          <div className="section-header">
            <div>
              <h3 className="section-title">Administrative Actions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Quick access to core admin features</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(a => {
              const c = colorMap[a.color];
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className={`flex items-center gap-4 p-4 rounded-xl border border-slate-200 ${c.hover} hover:shadow-sm transition-all card-hover group`}
                >
                  <div className={`icon-box ${c.bg}`}>
                    <a.icon className={`h-5 w-5 ${c.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800">{a.label}</p>
                    <p className="text-xs text-slate-400 truncate">{a.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <div className="section-header">
            <h3 className="section-title">User Distribution</h3>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div style={{ height: 220 }}>
            <Pie
              data={pieData}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#64748b', font: { size: 11 }, boxWidth: 12, padding: 12 }
                  }
                }
              }}
            />
          </div>
          {/* Breakdown */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Students', value: stats?.users?.students || 0, color: 'bg-indigo-500' },
              { label: 'Teachers', value: stats?.users?.teachers || 0, color: 'bg-sky-500' },
              { label: 'HODs', value: stats?.users?.hods || 0, color: 'bg-emerald-500' },
              { label: 'Admins', value: stats?.users?.admins || 0, color: 'bg-amber-500' },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${r.color}`} />
                <span className="text-xs text-slate-500">{r.label}:</span>
                <span className="text-xs font-bold text-slate-700">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
