import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  BarChart3, BookOpen, Users, TrendingUp, FileSpreadsheet,
  Award, Target, ChevronRight
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { useSelector } from 'react-redux';
import { getDepartmentFullName } from '../utils/departmentHelper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HODDashboard = () => {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/hod')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const barOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    }
  };

  const gpaData = {
    labels: stats?.gpaByCourse?.map(c => c.courseCode) || ['SE101', 'SE202', 'SE303', 'SE404'],
    datasets: [{
      label: 'Avg GPA',
      data: stats?.gpaByCourse?.map(c => c.avgGPA) || [3.2, 3.4, 2.9, 3.6],
      backgroundColor: '#4f46e5',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const attData = {
    labels: stats?.attendanceByCourse?.map(c => c.courseCode) || ['SE101', 'SE202', 'SE303', 'SE404'],
    datasets: [{
      label: 'Attendance %',
      data: stats?.attendanceByCourse?.map(c => c.avgAttendance) || [88, 91, 84, 94],
      backgroundColor: '#0ea5e9',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const kpis = [
    { label: 'Dept. Students', value: stats?.students || 0, sub: `${getDepartmentFullName(user?.department)} Department`, icon: Users, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { label: 'Faculty Members', value: stats?.teachers || 0, sub: 'Academic staff', icon: TrendingUp, iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { label: 'Active Courses', value: stats?.courses || 0, sub: 'Approved curriculum', icon: BookOpen, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-5 bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white">
        <div className="flex items-center gap-2 mb-0.5">
          <Award className="h-4 w-4 text-emerald-200" />
          <p className="text-emerald-200 text-sm font-medium">Head of Department</p>
        </div>
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'HOD'} 👋</h1>
        <p className="text-emerald-100 text-sm mt-1">
          Department overview — {stats?.students || 0} students · {stats?.teachers || 0} faculty
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="stat-card">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{k.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{k.value}</p>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </div>
            <div className={`icon-box ${k.iconBg}`}>
              <k.icon className={`h-5 w-5 ${k.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GPA Chart */}
        <div className="card p-5">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <div className="icon-box bg-indigo-50 h-8 w-8 rounded-lg">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="section-title">GPA Performance</h3>
                <p className="text-xs text-slate-400">By course · This semester</p>
              </div>
            </div>
            <span className="badge-blue">GPA</span>
          </div>
          <div style={{ height: 240 }}>
            <Bar
              data={gpaData}
              options={{
                ...barOpts,
                scales: {
                  ...barOpts.scales,
                  y: { ...barOpts.scales.y, min: 0, max: 4, ticks: { ...barOpts.scales.y.ticks, stepSize: 1 } }
                }
              }}
            />
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="card p-5">
          <div className="section-header">
            <div className="flex items-center gap-2">
              <div className="icon-box bg-sky-50 h-8 w-8 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <h3 className="section-title">Attendance Rates</h3>
                <p className="text-xs text-slate-400">By course · Average %</p>
              </div>
            </div>
            <span className="badge-sky">ATT %</span>
          </div>
          <div style={{ height: 240 }}>
            <Bar
              data={attData}
              options={{
                ...barOpts,
                scales: {
                  ...barOpts.scales,
                  y: { ...barOpts.scales.y, min: 0, max: 100, ticks: { ...barOpts.scales.y.ticks } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* GPA by Course Table */}
      {stats?.gpaByCourse && stats.gpaByCourse.length > 0 && (
        <div className="table-wrapper">
          <div className="p-5 border-b border-slate-200 section-header">
            <div>
              <h3 className="section-title">Course Performance Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">Detailed breakdown per course</p>
            </div>
            <Target className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-head">
                <tr>
                  {['Course Code', 'Course Name', 'Avg GPA', 'Attendance %', 'Status'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.gpaByCourse.map((c, i) => {
                  const gpa = c.avgGPA || 3.0;
                  const att = stats.attendanceByCourse?.[i]?.avgAttendance || 85;
                  const gpaStatus = gpa >= 3.0 ? 'Good' : gpa >= 2.5 ? 'Average' : 'Below Par';
                  const gpaBadge = gpa >= 3.0 ? 'badge-green' : gpa >= 2.5 ? 'badge-amber' : 'badge-red';
                  return (
                    <tr key={c.courseCode} className="table-row-hover">
                      <td className="table-td"><span className="badge-blue">{c.courseCode}</span></td>
                      <td className="table-td font-medium text-slate-800">{c.courseName || c.courseCode}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-20">
                            <div className="progress-fill bg-indigo-500" style={{ width: `${(gpa / 4) * 100}%` }} />
                          </div>
                          <span className="font-semibold text-slate-700">{gpa.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-20">
                            <div className={`progress-fill ${att >= 75 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${att}%` }} />
                          </div>
                          <span className="font-semibold text-slate-700">{att}%</span>
                        </div>
                      </td>
                      <td className="table-td"><span className={gpaBadge}>{gpaStatus}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard;
