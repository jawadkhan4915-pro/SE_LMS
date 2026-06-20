import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { 
  BookOpen, User, Users, PlusCircle, CheckCircle, 
  Clock, X, ChevronDown, AlertCircle, HelpCircle, XCircle 
} from 'lucide-react';

const categoryColors = {
  'AI': 'bg-indigo-50 border border-indigo-200 text-indigo-700',
  'ML': 'bg-purple-50 border border-purple-200 text-purple-700',
  'SE': 'bg-sky-50 border border-sky-200 text-sky-700',
  'CS': 'bg-blue-50 border border-blue-200 text-blue-700',
  'Math': 'bg-amber-50 border border-amber-200 text-amber-700',
  'default': 'bg-slate-50 border border-slate-200 text-slate-700'
};

const getCategoryBadge = (cat) => {
  return categoryColors[cat] || categoryColors['default'];
};

const Courses = () => {
  const { user } = useSelector((s) => s.auth);
  const [courses, setCourses] = useState([]);
  const [available, setAvailable] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals/UI States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [requestModalCourse, setRequestModalCourse] = useState(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchCoursesAndRequests = async () => {
    setLoading(true);
    try {
      // Get enrolled courses
      const r = await api.get('/courses');
      setCourses(r.data.data);

      if (user?.role === 'student') {
        // Get student's enrollment requests
        const reqRes = await api.get('/enrollment-requests/my');
        setRequests(reqRes.data.data);

        // Get all courses to filter available ones
        const allRes = await api.get('/courses/all');
        
        const enrolledIds = r.data.data.map(c => c._id);
        const requestedIds = reqRes.data.data.map(req => req.course?._id || req.course);
        
        // Available are courses that student is NOT enrolled in AND has NOT requested
        const filteredAvailable = allRes.data.data.filter(
          c => !enrolledIds.includes(c._id) && !requestedIds.includes(c._id)
        );
        setAvailable(filteredAvailable);
      }
    } catch (e) { 
      console.error(e); 
      showMsg('Failed to load courses data', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchCoursesAndRequests(); 
  }, [user]);

  const handleOpenRequestModal = (course) => {
    setRequestModalCourse(course);
    setReason('');
  };

  const handleEnrollRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestModalCourse) return;

    try {
      const res = await api.post('/enrollment-requests', {
        courseId: requestModalCourse._id,
        reason
      });
      showMsg(res.data.message || 'Enrollment request submitted successfully!', 'success');
      setRequestModalCourse(null);
      fetchCoursesAndRequests();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to submit enrollment request', 'error');
    }
  };

  const handleViewRoster = async (course) => {
    setSelectedCourse(course);
    setRosterLoading(true);
    try {
      const r = await api.get(`/courses/${course._id}/students`);
      setRoster(r.data.data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setRosterLoading(false); 
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Course Center</h1>
        <p className="page-subtitle">
          {user?.role === 'student' 
            ? `Enrolled: ${courses.length} · Pending Requests: ${requests.filter(r => r.status === 'pending').length} · Available: ${available.length}`
            : `Assigned Courses: ${courses.length}`
          }
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={message.type === 'error' ? 'alert-error' : 'alert-success'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Enrolled Courses */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          {user?.role === 'student' ? 'My Enrolled Courses' : 'Assigned Teaching Classes'} ({courses.length})
        </h3>
        {courses.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No courses recorded at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map(course => (
              <div key={course._id} className="card card-hover p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge-blue text-[10px]">{course.code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                      {course.creditHours} credit hours
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base leading-snug mb-1">{course.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                  
                  {course.category && (
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getCategoryBadge(course.category)}`}>
                      {course.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                    <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{course.teacher?.name || 'TBA'}</span>
                  </div>
                  {user?.role === 'student' ? (
                    <span className="badge-green text-[9px] font-bold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleViewRoster(course)}
                      className="btn-secondary btn-sm flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" /> Roster
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Specific: Enrollment Requests */}
      {user?.role === 'student' && requests.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Enrollment Request Statuses ({requests.length})
          </h3>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th text-left">Course</th>
                    <th className="table-th text-left">Code</th>
                    <th className="table-th text-left">Credits</th>
                    <th className="table-th text-left">Date Requested</th>
                    <th className="table-th text-left">Status</th>
                    <th className="table-th text-left">Note / Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => {
                    const statusColors = {
                      pending: 'bg-amber-50 border border-amber-250 text-amber-600',
                      approved: 'bg-emerald-50 border border-emerald-250 text-emerald-600',
                      rejected: 'bg-rose-50 border border-rose-250 text-rose-600'
                    };
                    const statusIcons = {
                      pending: <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />,
                      approved: <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />,
                      rejected: <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    };
                    return (
                      <tr key={req._id} className="table-row-hover">
                        <td className="table-td font-semibold text-slate-800 text-xs">
                          {req.course?.name || 'Unknown Course'}
                        </td>
                        <td className="table-td text-slate-500 text-xs">
                          {req.course?.code}
                        </td>
                        <td className="table-td text-slate-500 text-xs text-center">
                          {req.course?.creditHours}
                        </td>
                        <td className="table-td text-slate-400 text-xs">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="table-td">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${statusColors[req.status] || ''}`}>
                            {statusIcons[req.status]}
                            {req.status}
                          </span>
                        </td>
                        <td className="table-td text-xs text-slate-500">
                          {req.status === 'rejected' && req.rejectionReason && (
                            <span className="text-red-500 font-medium">{req.rejectionReason}</span>
                          )}
                          {req.status === 'approved' && (
                            <span className="text-emerald-600 font-medium">Approved by HOD/Admin. Enrolled automatically!</span>
                          )}
                          {req.status === 'pending' && req.reason && (
                            <span className="italic">"{req.reason}"</span>
                          )}
                          {req.status === 'pending' && !req.reason && (
                            <span className="text-slate-400 italic">No notes added</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Specific: Available Courses */}
      {user?.role === 'student' && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Available Courses for Enrollment ({available.length})
          </h3>
          {available.length === 0 ? (
            <div className="card p-10 text-center">
              <CheckCircle className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">You have already enrolled or requested all available courses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {available.map(course => (
                <div key={course._id} className="card card-hover p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge-blue text-[10px]">{course.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                        {course.creditHours} cr
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base leading-snug mb-1">{course.name}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{course.description}</p>
                    
                    {course.category && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getCategoryBadge(course.category)}`}>
                        {course.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                      <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{course.teacher?.name || 'TBA'}</span>
                    </div>
                    <button 
                      onClick={() => handleOpenRequestModal(course)} 
                      className="btn-primary btn-sm flex items-center gap-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Request Enrollment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Roster Modal */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedCourse.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedCourse.code} · {selectedCourse.creditHours} cr · {selectedCourse.teacher?.name}
                  </p>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="btn-secondary btn-icon">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700">Enrolled Students</h4>
                <span className="badge-blue">{roster.length} students</span>
              </div>

              {rosterLoading ? (
                <div className="flex justify-center py-8"><div className="spinner" /></div>
              ) : roster.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No students enrolled yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {roster.map((r, i) => (
                    <div key={r.enrollmentId || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {r.student?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{r.student?.name}</p>
                          <p className="text-xs text-slate-400">{r.student?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600">Grade: {r.grade || 'IP'}</p>
                        <p className="text-[10px] text-slate-400">{r.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100">
              <button onClick={() => setSelectedCourse(null)} className="btn-secondary w-full">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Justification Modal */}
      {requestModalCourse && (
        <div className="modal-overlay" onClick={() => setRequestModalCourse(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleEnrollRequestSubmit}>
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Course Enrollment Request</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Requesting approval to join: <strong className="text-slate-700 font-semibold">{requestModalCourse.name}</strong> ({requestModalCourse.code})
                    </p>
                  </div>
                  <button type="button" onClick={() => setRequestModalCourse(null)} className="btn-secondary btn-icon">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="form-label block mb-1">Justification Reason (Optional)</label>
                  <p className="text-[11px] text-slate-400 mb-2">Provide a short note or explanation to the HOD/Administration for enrolling in this course.</p>
                  <textarea
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-500 h-24 resize-none"
                    placeholder="e.g. This is a core course needed for my SE degree specialization or major project pathway."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setRequestModalCourse(null)} 
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary w-full"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
