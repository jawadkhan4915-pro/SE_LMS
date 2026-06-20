import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Video, 
  Plus, 
  Calendar, 
  Clock, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

const OnlineLectures = () => {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();

  const [lectures, setLectures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form Fields
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lecturesRes, coursesRes] = await Promise.all([
        api.get('/lectures'),
        api.get('/courses')
      ]);
      setLectures(lecturesRes.data.data);
      setCourses(coursesRes.data.data);
      if (coursesRes.data.data.length > 0) {
        setCourseId(coursesRes.data.data[0]._id);
      }
    } catch (e) {
      console.error(e);
      showMsg('Failed to load online lectures data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!courseId || !title || !date || !startTime || !endTime) {
      showMsg('Please fill in all fields', 'error');
      return;
    }

    try {
      await api.post('/lectures', {
        courseId,
        title,
        description,
        date,
        startTime,
        endTime
      });
      showMsg('Lecture scheduled successfully!');
      setTitle('');
      setDescription('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setIsOpen(false);
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to schedule lecture', 'error');
    }
  };

  const handleCopyLink = (meetingId) => {
    const lectureUrl = `${window.location.origin}/lecture/${meetingId}`;
    navigator.clipboard.writeText(lectureUrl);
    showMsg('Lecture link copied to clipboard!');
  };

  const handleStartLecture = async (meetingId) => {
    try {
      // Toggle lecture to active
      await api.put(`/lectures/${meetingId}/state`, { isActive: true });
      navigate(`/lecture/${meetingId}`);
    } catch (err) {
      // Fallback: navigate directly
      navigate(`/lecture/${meetingId}`);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Video className="h-6 w-6" />
            </div>
            Online Lectures
          </h1>
          <p className="text-slate-500 text-sm mt-1">Schedule, manage, and join video lectures inside the LMS</p>
        </div>
        {isTeacher && (
          <button onClick={() => setIsOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Arrange Lecture
          </button>
        )}
      </div>

      {/* Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm animate-fade-in ${
          message.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Lectures List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {lectures.length === 0 ? (
          <div className="col-span-full card p-16 text-center flex flex-col items-center justify-center border border-slate-200 bg-white rounded-2xl shadow-sm">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
              <Video className="h-8 w-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No Online Lectures</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm">
              {isTeacher 
                ? 'You have not scheduled any lectures yet. Click "Arrange Lecture" to create one.' 
                : 'There are no active or scheduled lectures for your enrolled courses right now.'}
            </p>
          </div>
        ) : lectures.map(lecture => {
          const isLive = lecture.isActive;
          const lectureDate = new Date(lecture.date);
          const formattedDate = lectureDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div 
              key={lecture._id} 
              className={`card p-6 border rounded-2xl bg-white shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isLive ? 'border-red-300 ring-2 ring-red-50' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Course and Status */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold px-2 py-1 flex items-center gap-1.5 border border-indigo-100">
                      <BookOpen className="h-3.5 w-3.5" />
                      {lecture.course?.code}
                    </span>
                    <span className="text-xs font-medium text-slate-500 truncate max-w-[150px]">
                      {lecture.course?.name}
                    </span>
                  </div>
                  <div>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-full animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-red-600" />
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium rounded-full">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>

                {/* Lecture Details */}
                <h3 className="text-base font-bold text-slate-800 line-clamp-1">{lecture.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[32px]">
                  {lecture.description || 'No description provided.'}
                </p>

                {/* Time & Teacher Info */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {lecture.startTime} - {lecture.endTime}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                {isTeacher ? (
                  <>
                    <button 
                      onClick={() => handleStartLecture(lecture.meetingId)}
                      className="btn-primary py-2.5 px-4 text-xs font-semibold flex-1 flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Start Lecture
                    </button>
                    <button 
                      onClick={() => handleCopyLink(lecture.meetingId)}
                      className="btn-secondary py-2.5 px-3.5 text-xs font-semibold flex items-center justify-center gap-2"
                      title="Copy Meeting Link"
                    >
                      <Copy className="h-4 w-4" />
                      Link
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => navigate(`/lecture/${lecture.meetingId}`)}
                    className={`py-2.5 px-4 text-xs font-semibold flex-1 flex items-center justify-center gap-2 rounded-xl transition-all ${
                      isLive 
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm border border-red-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-700'
                    }`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isLive ? 'Join Lecture' : 'Enter Lecture Room'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrange Lecture Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <form className="modal-box max-w-lg" onSubmit={handleCreate} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-150 bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Arrange Online Lecture</h3>
                <p className="text-xs text-slate-500 mt-0.5">Setup a virtual class session</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary p-1.5 rounded-lg border border-slate-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Course</label>
                <select 
                  className="form-select" 
                  value={courseId} 
                  onChange={e => setCourseId(e.target.value)}
                  required
                >
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Lecture Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chapter 4: Object-Oriented Analysis & Design" 
                  className="form-input" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div>
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  placeholder="Provide topics covered, links, pre-reads, etc." 
                  className="form-textarea min-h-[80px]" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Date *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">Start Time *</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="form-label">End Time *</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1 py-2.5">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1 py-2.5">
                Schedule Lecture
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OnlineLectures;
