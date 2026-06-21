import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Users,
  BookOpen,
  Filter,
  Info,
  X,
  Search,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CLASSROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 104', 'Lab 1', 'Lab 2', 'Seminar Room'];

const Timetable = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;

  // Timetable records state
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: '', type: '' });

  // Filters state
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [teacherSemesters, setTeacherSemesters] = useState([]); // Semesters where teacher teaches

  // Options loaded from backend (for Admin dropdowns)
  const [allCourses, setAllCourses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Admin View toggles: 'schedule' (CRUD & view) or 'free-rooms' (analyzer)
  const [currentView, setCurrentView] = useState('schedule');

  // Classroom Analyzer state
  const [chkDay, setChkDay] = useState('Monday');
  const [chkStartTime, setChkStartTime] = useState('09:00');
  const [chkEndTime, setChkEndTime] = useState('10:30');
  const [analyzerData, setAnalyzerData] = useState(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);

  // Add/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // null if adding new
  const [formCourseId, setFormCourseId] = useState('');
  const [formDay, setFormDay] = useState('Monday');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:30');
  const [formClassroom, setFormClassroom] = useState('Room 101');
  const [formError, setFormError] = useState('');

  // Auto-clear feedback alerts
  const showFeedback = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: '' }), 6000);
  };

  // Fetch timetable entries based on current filters and user role
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let url = '/timetable';
      const params = {};

      if (userRole === 'student') {
        // No filters needed; backend returns enrolled course entries
      } else if (userRole === 'teacher') {
        if (selectedSemester) {
          params.semester = selectedSemester;
        }
      } else if (userRole === 'admin' || userRole === 'hod') {
        if (selectedSemester) params.semester = selectedSemester;
        if (selectedTeacherId) params.teacherId = selectedTeacherId;
        if (selectedClassroom) params.classroom = selectedClassroom;
        if (selectedStudentId) params.studentId = selectedStudentId;
      }

      const res = await api.get(url, { params });
      setEntries(res.data.data || []);
    } catch (err) {
      console.error(err);
      showFeedback('Failed to load timetable slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch static data (courses & teachers) for admin options
  const fetchAdminOptions = async () => {
    if (userRole !== 'admin' && userRole !== 'hod' && userRole !== 'teacher') return;
    try {
      // 1. Fetch courses
      const courseRes = await api.get('/courses/all');
      setAllCourses(courseRes.data.data || []);

      // 2. If teacher, extract semesters they teach to populate filter
      if (userRole === 'teacher') {
        // Get courses this teacher teaches
        const teacherCourses = (courseRes.data.data || []).filter(
          c => c.teacher?._id === user.id || c.teacher === user.id
        );
        const uniqueSemesters = Array.from(new Set(teacherCourses.map(c => c.semester))).sort();
        setTeacherSemesters(uniqueSemesters);
      }

      // 3. If admin, fetch teacher and student lists
      if (userRole === 'admin' || userRole === 'hod') {
        const teacherRes = await api.get('/users', { params: { role: 'teacher', limit: 100 } });
        setAllTeachers(teacherRes.data.data || []);

        const studentRes = await api.get('/users', { params: { role: 'student', limit: 100 } });
        setAllStudents(studentRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run initial fetching
  useEffect(() => {
    fetchTimetable();
    fetchAdminOptions();
  }, [userRole, selectedSemester, selectedTeacherId, selectedClassroom, selectedStudentId]);

  // Run analyzer when filters change
  const runAnalyzer = async () => {
    setAnalyzerLoading(true);
    setFormError('');
    try {
      const res = await api.get('/timetable/free-classrooms', {
        params: {
          day: chkDay,
          startTime: chkStartTime,
          endTime: chkEndTime
        }
      });
      setAnalyzerData(res.data.data);
    } catch (err) {
      console.error(err);
      showFeedback(err.response?.data?.message || 'Failed to run classroom availability analysis', 'error');
    } finally {
      setAnalyzerLoading(false);
    }
  };

  // Fetch analyzer on mounting admin view
  useEffect(() => {
    if (currentView === 'free-rooms' && userRole === 'admin') {
      runAnalyzer();
    }
  }, [currentView, chkDay, chkStartTime, chkEndTime]);

  // Open modal for Adding new slot
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormCourseId(allCourses[0]?._id || '');
    setFormDay('Monday');
    setFormStartTime('08:30');
    setFormEndTime('10:00');
    setFormClassroom('Room 101');
    setFormError('');
    setModalOpen(true);
  };

  // Open modal for Editing existing slot
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setFormCourseId(entry.course?._id || entry.course);
    setFormDay(entry.day);
    setFormStartTime(entry.startTime);
    setFormEndTime(entry.endTime);
    setFormClassroom(entry.classroom);
    setFormError('');
    setModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formCourseId) {
      setFormError('Please select a course');
      return;
    }

    const payload = {
      courseId: formCourseId,
      day: formDay,
      startTime: formStartTime,
      endTime: formEndTime,
      classroom: formClassroom
    };

    try {
      if (editingEntry) {
        // Edit API call
        await api.put(`/timetable/${editingEntry._id}`, payload);
        showFeedback('Timetable slot updated successfully!', 'success');
      } else {
        // Create API call
        await api.post('/timetable', payload);
        showFeedback('New timetable slot scheduled successfully!', 'success');
      }
      setModalOpen(false);
      fetchTimetable();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error occurred while saving timetable entry');
    }
  };

  // Handle delete timetable slot
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled class from the timetable?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      showFeedback('Timetable entry deleted successfully', 'success');
      fetchTimetable();
    } catch (err) {
      console.error(err);
      showFeedback('Failed to delete timetable entry', 'error');
    }
  };

  // Group entries by day of the week
  const groupedEntries = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter((e) => e.day === day);
    return acc;
  }, {});

  const hasScheduledEntries = entries.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-indigo-600" />
            Timetable Center
          </h1>
          <p className="page-subtitle text-sm text-slate-500 mt-1">
            {userRole === 'student' && `Manage and view your semester course schedules`}
            {userRole === 'teacher' && `View your assigned classes and section timetables`}
            {userRole === 'admin' && `Manage department scheduling, resolve conflicts, and track classroom status`}
          </p>
        </div>

        {/* Admin controls */}
        {userRole === 'admin' && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setCurrentView(currentView === 'schedule' ? 'free-rooms' : 'schedule')}
              className={`btn-secondary btn-sm px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                currentView === 'free-rooms'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {currentView === 'schedule' ? (
                <>
                  <MapPin className="h-4 w-4 shrink-0 text-indigo-600" />
                  Room Availability
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 shrink-0 text-indigo-600" />
                  Manage Schedules
                </>
              )}
            </button>

            {currentView === 'schedule' && (
              <button
                onClick={handleOpenAdd}
                className="btn-primary btn-sm px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Schedule
              </button>
            )}
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm animate-fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-250 text-emerald-800'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Main View Render */}
      {currentView === 'schedule' ? (
        <>
          {/* Filters Bar */}
          {(userRole === 'admin' || userRole === 'hod' || userRole === 'teacher') && (
            <div className="card p-5 bg-white border border-slate-150 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700">
                <Filter className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter Timetable By:</span>
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                {/* Semester filter (For Teachers and Admins) */}
                {(userRole === 'admin' || userRole === 'hod' || userRole === 'teacher') && (
                  <div className="flex flex-col min-w-[140px] flex-1 md:flex-none">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Semester</label>
                    <select
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                      <option value="">
                        {userRole === 'teacher' ? 'My Schedule' : 'All Semesters'}
                      </option>
                      {userRole === 'teacher' ? (
                        teacherSemesters.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem} Timetable
                          </option>
                        ))
                      ) : (
                        [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                {/* Teacher filter (For Admin only) */}
                {(userRole === 'admin' || userRole === 'hod') && (
                  <div className="flex flex-col min-w-[180px] flex-1 md:flex-none">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Teacher</label>
                    <select
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                    >
                      <option value="">All Teachers</option>
                      {allTeachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Classroom filter (For Admin only) */}
                {(userRole === 'admin' || userRole === 'hod') && (
                  <div className="flex flex-col min-w-[140px] flex-1 md:flex-none">
                     <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Classroom</label>
                     <select
                       className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                       value={selectedClassroom}
                       onChange={(e) => setSelectedClassroom(e.target.value)}
                     >
                       <option value="">All Classrooms</option>
                       {CLASSROOMS.map((room) => (
                         <option key={room} value={room}>
                           {room}
                         </option>
                       ))}
                     </select>
                  </div>
                )}

                {/* Student filter (For Admin only) */}
                {(userRole === 'admin' || userRole === 'hod') && (
                  <div className="flex flex-col min-w-[180px] flex-1 md:flex-none">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Student</label>
                    <select
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                    >
                      <option value="">All Students</option>
                      {allStudents.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} (Sem {s.semester})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reset filters */}
                {(selectedSemester || selectedTeacherId || selectedClassroom || selectedStudentId) && (
                  <button
                    onClick={() => {
                      setSelectedSemester('');
                      setSelectedTeacherId('');
                      setSelectedClassroom('');
                      setSelectedStudentId('');
                    }}
                    className="self-end px-3 py-2 border border-slate-200 text-xs text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-50 font-medium transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Timetable Grid View */}
          {loading ? (
            <div className="flex flex-col h-72 items-center justify-center space-y-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-slate-400 text-sm font-medium">Fetching schedule database...</p>
            </div>
          ) : !hasScheduledEntries ? (
            <div className="card p-12 text-center border-slate-150 rounded-2xl flex flex-col items-center justify-center">
              <Calendar className="h-14 w-14 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No Timetable Scheduled</h3>
              <p className="text-slate-400 text-sm max-w-sm mt-1 mx-auto leading-relaxed">
                There are no scheduled lectures or classes recorded for the selected search filters.
              </p>
              {userRole === 'admin' && (
                <button
                  onClick={handleOpenAdd}
                  className="mt-4 btn-primary btn-sm bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-all shadow-sm"
                >
                  Create First Timetable Entry
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {DAYS.map((day) => {
                const daySlots = groupedEntries[day] || [];
                if (daySlots.length === 0) return null;

                return (
                  <div key={day} className="card p-6 bg-white border border-slate-150 rounded-2xl shadow-sm space-y-4">
                    {/* Day Banner */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                        <h2 className="text-lg font-bold text-slate-800">{day}</h2>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold uppercase tracking-wider">
                        {daySlots.length} {daySlots.length === 1 ? 'Class' : 'Classes'}
                      </span>
                    </div>

                    {/* Class Cards Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {daySlots.map((slot) => (
                        <div
                          key={slot._id}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-150/80 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            {/* Time Slot & Room */}
                            <div className="flex items-center justify-between text-xs font-semibold mb-2">
                              <span className="flex items-center gap-1 text-slate-650">
                                <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center gap-1 font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                                {slot.classroom}
                              </span>
                            </div>

                            {/* Course name */}
                            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                              {slot.course?.name || 'Unknown Course'}
                            </h4>

                            {/* Course Code & Credits */}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-150">
                                {slot.course?.code}
                              </span>
                              {slot.course?.creditHours && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-150">
                                  {slot.course?.creditHours} Cr
                                </span>
                              )}
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-150">
                                Semester {slot.semester}
                              </span>
                            </div>
                          </div>

                          {/* Footer Details / Actions */}
                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500 min-w-0">
                              <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate italic font-medium">
                                {userRole === 'teacher' && slot.teacher?._id === user.id
                                  ? 'You'
                                  : slot.teacher?.name || 'TBA'}
                              </span>
                            </div>

                            {/* Admin specific action buttons */}
                            {userRole === 'admin' && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEdit(slot)}
                                  className="p-1.5 text-slate-450 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg transition-all"
                                  title="Edit entry"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteEntry(slot._id)}
                                  className="p-1.5 text-slate-450 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                                  title="Delete entry"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Classroom Availability Analyzer Component */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selector Card */}
          <div className="card p-6 bg-white border border-slate-150 rounded-2xl shadow-sm h-fit space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Search className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">Check Classrooms</h2>
            </div>

            <div className="space-y-4">
              {/* Day */}
              <div>
                <label className="text-xs font-bold text-slate-550 block mb-1">Select Day</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  value={chkDay}
                  onChange={(e) => setChkDay(e.target.value)}
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time slot inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-550 block mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    value={chkStartTime}
                    onChange={(e) => setChkStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-550 block mb-1">End Time</label>
                  <input
                    type="time"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    value={chkEndTime}
                    onChange={(e) => setChkEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Status information */}
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex gap-2">
                <Info className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-normal">
                  Analyzing rooms checks all timetable classes on <strong className="text-slate-700">{chkDay}</strong>.
                  Rooms with schedules overlapping <strong className="text-slate-700">{chkStartTime} - {chkEndTime}</strong> will be marked occupied.
                </p>
              </div>
            </div>
          </div>

          {/* Results Analysis */}
          <div className="card lg:col-span-2 p-6 bg-white border border-slate-150 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">Occupancy Breakdown</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Availability status on {chkDay} during {chkStartTime} - {chkEndTime}
                </p>
              </div>
              <div className="flex gap-2">
                {analyzerData && (
                  <>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                      {analyzerData.freeClassrooms.length} Free
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 font-bold uppercase tracking-wider flex items-center gap-1">
                      {analyzerData.occupiedClassrooms.length} Busy
                    </span>
                  </>
                )}
              </div>
            </div>

            {analyzerLoading ? (
              <div className="flex flex-col h-64 items-center justify-center space-y-2">
                <div className="h-7 w-7 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
                <p className="text-slate-450 text-xs font-semibold">Running database audit...</p>
              </div>
            ) : !analyzerData ? (
              <p className="text-sm text-slate-400 italic text-center py-10">Select day and times to analyze rooms.</p>
            ) : (
              <div className="space-y-6">
                {/* Rooms Grid */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Classrooms Audit</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analyzerData.allClassrooms.map((room) => {
                      const isFree = analyzerData.freeClassrooms.includes(room);
                      // Find if occupied details exist
                      const occupancy = analyzerData.occupancies.find((o) => o.classroom === room);

                      return (
                        <div
                          key={room}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isFree
                              ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900 shadow-sm shadow-emerald-50'
                              : 'bg-rose-50/40 border-rose-150 text-rose-900 shadow-sm shadow-rose-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm tracking-wide flex items-center gap-1">
                              <MapPin className={`h-4 w-4 ${isFree ? 'text-emerald-500' : 'text-rose-500'}`} />
                              {room}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isFree ? 'Free / Available' : 'Busy'}
                            </span>
                          </div>

                          {!isFree && occupancy ? (
                            <div className="mt-2 space-y-1.5">
                              <div className="flex items-start gap-1">
                                <BookOpen className="h-3.5 w-3.5 text-rose-450 shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold text-rose-800 leading-tight">
                                  {occupancy.course?.name} ({occupancy.course?.code})
                                </p>
                              </div>
                              <p className="text-[10px] text-rose-600 font-medium pl-4.5">
                                Teacher: {occupancy.teacher?.name || 'TBA'}
                              </p>
                              <div className="flex items-center gap-1 pl-4.5 text-[10px] text-rose-600 font-medium">
                                <Clock className="h-3 w-3 shrink-0" />
                                Schedule: {occupancy.startTime} - {occupancy.endTime}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-emerald-700 mt-1 italic pl-5 font-medium">
                              Room is fully empty and available for scheduling.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline description */}
                {analyzerData.occupancies.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Conflicts Details</h3>
                    <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/50">
                      <div className="p-3.5 border-b border-slate-150 bg-slate-50 flex items-center gap-2">
                        <Info className="h-4.5 w-4.5 text-rose-500" />
                        <span className="text-xs font-bold text-slate-700">Currently Scheduled Conflicts</span>
                      </div>
                      <div className="p-4 space-y-2 max-h-52 overflow-y-auto">
                        {analyzerData.occupancies.map((o, idx) => (
                          <div key={idx} className="text-xs flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100">
                            <span className="font-semibold text-slate-750">{o.classroom}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-medium">{o.course?.code}</span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span className="text-slate-500 font-medium">{o.startTime} - {o.endTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRUD Form Dialog Modal */}
      {modalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="modal-box w-full max-w-md bg-white border border-slate-150 rounded-3xl shadow-xl overflow-hidden animate-scale-up">
            <form onSubmit={handleFormSubmit}>
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {editingEntry ? 'Edit Scheduled Class' : 'Schedule a New Class'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assign a course, time range, and free classroom.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-650 bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Modal Error Message */}
                {formError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-normal font-medium">{formError}</span>
                  </div>
                )}

                {/* Course Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-550 block mb-1.5">Select Course</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Choose Course --</option>
                    {allCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} - {c.name} (Sem {c.semester} · {c.teacher?.name || 'No Teacher'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-550 block mb-1.5">Day of Week</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    required
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time range inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-550 block mb-1.5">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-550 block mb-1.5">End Time</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Classroom Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-550 block mb-1.5">Select Classroom</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    value={formClassroom}
                    onChange={(e) => setFormClassroom(e.target.value)}
                    required
                  >
                    {CLASSROOMS.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary w-full py-2.5 text-xs font-bold border border-slate-200 hover:bg-slate-100 text-slate-650 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                >
                  {editingEntry ? 'Update Schedule' : 'Assign Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
