import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { CalendarCheck, BookOpen, CheckCircle, Save, AlertCircle } from 'lucide-react';

const MarkAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState({}); // studentId: 'present'/'absent'/'late'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [lectureTime, setLectureTime] = useState('08:00 AM - 09:30 AM');
  const [topic, setTopic] = useState('');

  const fetchCourses = async () => {
    try {
      const coursesRes = await api.get('/courses');
      setCourses(coursesRes.data.data);
      if (coursesRes.data.data.length > 0) {
        setSelectedCourseId(coursesRes.data.data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCourseRoster = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const rosterRes = await api.get(`/courses/${selectedCourseId}/students`);
      setStudents(rosterRes.data.data);
      
      // Default all statuses to 'present'
      const initialRecords = {};
      rosterRes.data.data.forEach((r) => {
        initialRecords[r.student._id] = 'present';
      });
      setRecords(initialRecords);

      // Check if attendance already exists for this date to pre-populate
      const logsRes = await api.get(`/attendance/course/${selectedCourseId}`);
      const selectedDateObj = new Date(date);
      selectedDateObj.setUTCHours(0,0,0,0);
      
      const existingSheet = logsRes.data.data.find(log => {
        const logDate = new Date(log.date);
        logDate.setUTCHours(0,0,0,0);
        return logDate.getTime() === selectedDateObj.getTime();
      });

      if (existingSheet) {
        if (existingSheet.records) {
          const prepopulated = {};
          existingSheet.records.forEach((rec) => {
            prepopulated[rec.student._id || rec.student] = rec.status;
          });
          setRecords(prepopulated);
        }
        setLectureTime(existingSheet.lectureTime || '08:00 AM - 09:30 AM');
        setTopic(existingSheet.topic || '');
      } else {
        setLectureTime('08:00 AM - 09:30 AM');
        setTopic('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourseRoster();
  }, [selectedCourseId, date]);

  const handleStatusChange = (studentId, status) => {
    setRecords({
      ...records,
      [studentId]: status
    });
  };

  const handleSaveAttendance = async () => {
    const formattedRecords = Object.keys(records).map(id => ({
      studentId: id,
      status: records[id]
    }));

    if (formattedRecords.length === 0) return;

    try {
      await api.post('/attendance', {
        courseId: selectedCourseId,
        date,
        lectureTime,
        topic,
        records: formattedRecords
      });
      setMessage('Attendance sheet successfully saved.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save attendance');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading && courses.length > 0 && students.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-teal-400">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-teal-400" />
          <span>Mark Class Attendance</span>
        </h2>
        {students.length > 0 && (
          <button 
            onClick={handleSaveAttendance}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/10"
          >
            <Save className="h-4.5 w-4.5" />
            <span>Save Registry</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No courses assigned to mark attendance.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* selectors */}
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Course</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.code} • {course.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Session Date</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lecture Time / Slot</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                placeholder="e.g. 08:00 AM - 09:30 AM"
                value={lectureTime}
                onChange={(e) => setLectureTime(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lecture Topic</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs"
                placeholder="e.g. Introduction to MERN Stack"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>

          {/* Student roster list sheet */}
          <div className="md:col-span-2 glass-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>Attendance Roster List</span>
            </h3>

            {students.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">No students registered in this class.</p>
            ) : (
              <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto pr-2">
                {students.map((r) => (
                  <div key={r.student._id} className="flex items-center justify-between py-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">{r.student.name}</p>
                      <p className="text-slate-500">{r.student.email}</p>
                    </div>

                    {/* Presence status toggles */}
                    <div className="flex gap-1 bg-slate-950 p-1 border border-slate-850 rounded-lg">
                      {['present', 'absent', 'late'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(r.student._id, status)}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                            records[r.student._id] === status
                              ? status === 'present' ? 'bg-teal-500 text-slate-950 shadow' :
                                status === 'absent' ? 'bg-rose-500 text-slate-100 shadow' :
                                'bg-amber-500 text-slate-950 shadow'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
