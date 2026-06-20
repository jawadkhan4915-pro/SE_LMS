import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { CalendarCheck, Calendar, AlertCircle, BookOpen, CheckCircle, Clock, XCircle } from 'lucide-react';

const statusStyle = {
  present: { badge: 'badge-green', icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> },
  late:    { badge: 'badge-amber', icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> },
  absent:  { badge: 'badge-red',   icon: <XCircle className="h-3.5 w-3.5 text-red-500" /> },
};

const Attendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [logs, setLogs] = useState([]);
  const [percentData, setPercentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses').then(r => {
      setCourses(r.data.data);
      if (r.data.data.length > 0) setSelectedCourseId(r.data.data[0]._id);
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    setLoading(true);
    Promise.all([
      api.get(`/attendance/course/${selectedCourseId}`),
      api.get(`/attendance/course/${selectedCourseId}/percentage`)
    ]).then(([lr, pr]) => {
      setLogs(lr.data.data);
      setPercentData(pr.data.data);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [selectedCourseId]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const pct = percentData?.percentage || 0;
  const pctColor = pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500';
  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your class presence across all courses</p>
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">You're not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Course Selector */}
            <div className="card p-4">
              <label className="form-label">Select Course</label>
              <select
                className="form-select"
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
              >
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>

            {/* Attendance Summary */}
            {percentData && (
              <div className="card p-5 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Attendance Rate</p>

                {/* Big percentage */}
                <div className={`text-5xl font-black mb-2 ${pctColor}`}>{pct}%</div>
                <p className="text-xs text-slate-400 mb-4">of sessions attended</p>

                {/* Progress Bar */}
                <div className="progress-bar mb-4">
                  <div className={`progress-fill ${barColor}`} style={{ width: `${pct}%` }} />
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <p className="text-lg font-extrabold text-emerald-600">{percentData.present}</p>
                    <p className="text-[10px] text-emerald-500 font-semibold">Present</p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl">
                    <p className="text-lg font-extrabold text-amber-600">{percentData.late}</p>
                    <p className="text-[10px] text-amber-500 font-semibold">Late</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded-xl">
                    <p className="text-lg font-extrabold text-red-500">{percentData.absent}</p>
                    <p className="text-[10px] text-red-400 font-semibold">Absent</p>
                  </div>
                </div>

                {pct < 75 && (
                  <div className="alert-error mt-4 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs">Below 75% minimum requirement!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Session Log */}
          <div className="card lg:col-span-2">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-500" />
                <h3 className="section-title">Session Records</h3>
              </div>
              <span className="badge-blue">{logs.length} sessions</span>
            </div>

            <div className="overflow-y-auto max-h-96">
              {logs.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No sessions recorded yet.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="table-head sticky top-0">
                    <tr>
                      <th className="table-th">#</th>
                      <th className="table-th">Date & Day</th>
                      <th className="table-th">Lecture Time</th>
                      <th className="table-th">Topic / Topic Description</th>
                      <th className="table-th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => {
                      const d = new Date(log.date);
                      const style = statusStyle[log.status] || statusStyle.absent;
                      return (
                        <tr key={i} className="table-row-hover">
                          <td className="table-td text-slate-400 text-xs">{i + 1}</td>
                          <td className="table-td">
                            <span className="font-semibold text-slate-700 block">
                              {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {d.toLocaleDateString('en-US', { weekday: 'long' })}
                            </span>
                          </td>
                          <td className="table-td text-slate-600 text-xs font-medium">
                            {log.lectureTime || 'N/A'}
                          </td>
                          <td className="table-td text-slate-600 text-xs italic">
                            {log.topic || 'No topic details logged'}
                          </td>
                          <td className="table-td">
                            <div className="flex items-center gap-1.5">
                              {style.icon}
                              <span className={`${style.badge} text-[9px] capitalize`}>{log.status}</span>
                            </div>
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
      )}
    </div>
  );
};

export default Attendance;
