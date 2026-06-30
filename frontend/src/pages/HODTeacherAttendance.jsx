import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { getDepartmentFullName } from '../utils/departmentHelper';
import {
  Users, CheckCircle2, AlertTriangle, Calendar, Search, Filter, ShieldAlert
} from 'lucide-react';

const HODTeacherAttendance = () => {
  const { user } = useSelector((state) => state.auth);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, presentToday: 0, lateToday: 0 });

  useEffect(() => {
    fetchLogs();
  }, [dateFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateFilter) params.date = dateFilter;

      const res = await api.get('/attendance/teacher/department-logs', { params });
      if (res.data.success) {
        const fetchedLogs = res.data.data;
        setLogs(fetchedLogs);
        
        // Calculate daily attendance statistics from the logs of the selected date (or today)
        const targetDateStr = dateFilter 
          ? new Date(dateFilter).toDateString() 
          : new Date().toDateString();

        const dailyLogs = fetchedLogs.filter(
          log => new Date(log.date).toDateString() === targetDateStr
        );

        // Fetch total department faculty members dynamically (or estimate based on logs unique teachers)
        // Let's call /api/users to get department faculty count
        const teachersRes = await api.get('/users', {
          params: { role: 'teacher', department: user.department, limit: 100 }
        });
        
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
      console.error('Failed to fetch department logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
  };

  // Filter logs locally based on search input
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
      {/* Welcome Banner */}
      <div className="card p-5 bg-gradient-to-br from-emerald-600 to-teal-700 border-0 text-white flex items-center justify-between">
        <div>
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">
            {getDepartmentFullName(user?.department)} Department
          </p>
          <h1 className="text-2xl font-bold mt-1">Faculty Attendance Monitor</h1>
          <p className="text-emerald-200 text-sm mt-1">
            Track daily face check-ins and attendance records for academic staff.
          </p>
        </div>
        <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <Users className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Analytics KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Faculty</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</p>
            <p className="text-xs text-slate-400 mt-1">Active instructors</p>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Arrivals</p>
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
            <p className="text-xs text-slate-400 mt-1">Present percentage</p>
          </div>
          <div className="icon-box bg-purple-50 text-purple-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teacher by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 font-semibold"
            />
          </div>

          {(searchTerm || dateFilter) && (
            <button
              onClick={clearFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table Logs */}
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
            <table className="w-full">
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

export default HODTeacherAttendance;
