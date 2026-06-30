import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Users, CheckCircle2, AlertTriangle, Calendar, Search, Filter, ShieldAlert, Building2
} from 'lucide-react';

const AdminTeacherAttendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, presentToday: 0, lateToday: 0 });

  useEffect(() => {
    fetchLogs();
  }, [dateFilter, deptFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;
      if (deptFilter && deptFilter !== 'All') params.department = deptFilter;

      const res = await api.get('/attendance/teacher/admin-logs', { params });
      if (res.data.success) {
        const fetchedLogs = res.data.data;
        setLogs(fetchedLogs);

        // Daily statistics logs
        const targetDateStr = dateFilter 
          ? new Date(dateFilter).toDateString() 
          : new Date().toDateString();

        const dailyLogs = fetchedLogs.filter(
          log => new Date(log.date).toDateString() === targetDateStr
        );

        // Fetch overall faculty count dynamically
        const facultyParams = { role: 'teacher', limit: 100 };
        if (deptFilter && deptFilter !== 'All') facultyParams.department = deptFilter;
        
        const teachersRes = await api.get('/users', { params: facultyParams });
        const totalFaculty = teachersRes.data.success ? teachersRes.data.pagination.total : 0;
        
        const present = dailyLogs.filter(log => log.status === 'present').length;
        const late = dailyLogs.filter(log => log.status === 'late').length;

        setStats({
          total: totalFaculty,
          presentToday: present,
          lateToday: late
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setDeptFilter('All');
  };

  const filteredLogs = logs.filter((log) => {
    const teacherName = log.teacher?.name || '';
    const teacherEmail = log.teacher?.email || '';
    const matchText = teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      teacherEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchText;
  });

  const checkedInToday = stats.presentToday + stats.lateToday;
  const attendanceRate = stats.total > 0 ? ((checkedInToday / stats.total) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="card p-5 bg-gradient-to-br from-indigo-700 to-indigo-900 border-0 text-white flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            University administration panel
          </p>
          <h1 className="text-2xl font-bold mt-1 font-sans">Teacher Biometric Attendance Log</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Global monitoring panel to oversee faculty daily face attendance registrations and logs.
          </p>
        </div>
        <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <Building2 className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty Count</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-1">Registered teachers ({deptFilter})</p>
          </div>
          <div className="icon-box bg-indigo-50 text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Today</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.presentToday}</p>
            <p className="text-xs text-slate-400 mt-1">On-time check-ins</p>
          </div>
          <div className="icon-box bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Check-Ins</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{stats.lateToday}</p>
            <p className="text-xs text-slate-400 mt-1">After 09:00 AM</p>
          </div>
          <div className="icon-box bg-amber-50 text-amber-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Rate</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-1">{attendanceRate}%</p>
            <p className="text-xs text-slate-400 mt-1">Daily verification rate</p>
          </div>
          <div className="icon-box bg-purple-50 text-purple-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filters and search panel */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter dropdown */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 font-semibold cursor-pointer"
            >
              {['All', 'SE', 'CS', 'IT', 'EE'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Date Filter input */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 font-semibold cursor-pointer"
            />
          </div>

          {(searchTerm || dateFilter || deptFilter !== 'All') && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grid check-in logs table */}
      <div className="table-wrapper">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="section-title">Faculty Check-In Logs</h3>
          <span className="badge-blue">{filteredLogs.length} logs found</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="spinner h-8 w-8 text-indigo-600" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">No teacher attendance records match the filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="table-head">
                <tr>
                  {['Teacher Details', 'Department', 'Date', 'Check-In Time', 'Status'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const initial = log.teacher?.name?.charAt(0).toUpperCase() || 'T';
                  return (
                    <tr key={log._id} className="table-row-hover">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{log.teacher?.name}</p>
                            <p className="text-[11px] text-slate-400">{log.teacher?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className="badge-blue text-[10px]">{log.department}</span>
                      </td>
                      <td className="table-td font-medium text-slate-700">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="table-td font-medium text-slate-700">
                        {new Date(log.checkInTime).toLocaleTimeString(undefined, {
                          hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td className="table-td">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                          log.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {log.status?.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeacherAttendance;
