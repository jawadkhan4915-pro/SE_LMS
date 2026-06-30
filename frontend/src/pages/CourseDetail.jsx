import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { 
  ArrowLeft, MessageSquare, Users, Trash2, Pin, ThumbsUp, 
  Send, Sparkles, AlertCircle, CheckCircle, BookOpen, Clock
} from 'lucide-react';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discussion'); // 'discussion' | 'roster'
  
  // Discussions State
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Roster State
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const fetchCourseData = async () => {
    try {
      const courseRes = await api.get(`/courses`);
      // Find current course in the assigned/enrolled list
      const matched = courseRes.data.data.find(c => c._id === courseId);
      if (matched) {
        setCourse(matched);
      } else {
        // If not found in primary list (e.g. admin or coordinator checking), try general course lookup
        const allRes = await api.get('/courses/all');
        const adminMatched = allRes.data.data.find(c => c._id === courseId);
        setCourse(adminMatched);
      }
    } catch (err) {
      console.error(err);
      showMsg('Failed to load course properties', 'error');
    }
  };

  const fetchThreads = async () => {
    try {
      const res = await api.get(`/discussions/course/${courseId}`);
      setThreads(res.data.data);
      if (selectedThread) {
        // Keep selected thread details in sync
        const updated = res.data.data.find(t => t._id === selectedThread._id);
        if (updated) setSelectedThread(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoster = async () => {
    setRosterLoading(true);
    try {
      const r = await api.get(`/courses/${courseId}/students`);
      setRoster(r.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCourseData();
      await fetchThreads();
      setLoading(false);
    };
    init();
  }, [courseId]);

  useEffect(() => {
    if (activeTab === 'roster') {
      fetchRoster();
    }
  }, [activeTab]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setIsPosting(true);
    try {
      const res = await api.post('/discussions', {
        courseId,
        title: newThreadTitle,
        content: newThreadContent
      });
      showMsg('Discussion thread published!', 'success');
      setNewThreadTitle('');
      setNewThreadContent('');
      setThreads([res.data.data, ...threads]);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Posting failed', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      const res = await api.post(`/discussions/${selectedThread._id}/reply`, {
        content: replyContent
      });
      setSelectedThread(res.data.data);
      setReplyContent('');
      fetchThreads(); // Refresh main list
    } catch (err) {
      showMsg('Failed to post reply', 'error');
    }
  };

  const handleUpvoteThread = async (threadId) => {
    try {
      const res = await api.put(`/discussions/${threadId}/upvote`);
      if (selectedThread && selectedThread._id === threadId) {
        setSelectedThread(res.data.data);
      }
      setThreads(threads.map(t => t._id === threadId ? res.data.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (threadId) => {
    try {
      const res = await api.put(`/discussions/${threadId}/pin`);
      if (selectedThread && selectedThread._id === threadId) {
        setSelectedThread(res.data.data);
      }
      fetchThreads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('Delete this discussion thread permanently?')) return;
    try {
      await api.delete(`/discussions/${threadId}`);
      showMsg('Discussion thread removed');
      setSelectedThread(null);
      setThreads(threads.filter(t => t._id !== threadId));
    } catch (err) {
      showMsg('Could not delete thread', 'error');
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  if (!course) return (
    <div className="card p-10 text-center space-y-3">
      <AlertCircle className="h-10 w-10 text-red-400 mx-auto" />
      <p className="text-slate-400 text-sm">Course not found or unauthorized access.</p>
      <button onClick={() => navigate('/courses')} className="btn-secondary btn-sm mx-auto">Back to courses</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back & Breadcrumb */}
      <button 
        onClick={() => navigate('/courses')} 
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Course Center</span>
      </button>

      {/* Course Banner */}
      <div className="card p-6 bg-gradient-to-r from-indigo-900 to-indigo-950 border-indigo-800 text-white relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] uppercase font-bold tracking-widest">{course.code}</span>
            <span className="text-[10px] text-indigo-200">{course.creditHours} Credit Hours</span>
          </div>
          <h2 className="text-2xl font-black">{course.name}</h2>
          <p className="text-sm text-indigo-200/90 max-w-xl leading-relaxed">{course.description}</p>
          
          <div className="pt-2 flex items-center gap-2 text-xs text-indigo-300">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span>Instructor: <strong>{course.teacher?.name || 'TBA'}</strong></span>
          </div>
        </div>
        
        {/* Abstract graphic */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <BookOpen className="h-48 w-48 -mr-10 -mb-10 text-white" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => { setActiveTab('discussion'); setSelectedThread(null); }}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'discussion' 
              ? 'border-indigo-600 text-indigo-650' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Discussion Board</span>
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'roster' 
              ? 'border-indigo-600 text-indigo-650' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Class Roster</span>
        </button>
      </div>

      {/* Message alerts */}
      {message.text && (
        <div className={message.type === 'error' ? 'alert-error' : 'alert-success'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'discussion' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread Browser / Thread Details */}
          <div className="lg:col-span-2 space-y-4">
            {selectedThread ? (
              /* Thread Details Pane */
              <div className="card p-6 space-y-6">
                <button 
                  onClick={() => setSelectedThread(null)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-bold"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Back to all topics</span>
                </button>

                {/* Question Details */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      {selectedThread.isPinned && <Pin className="h-4 w-4 text-amber-500 fill-amber-500" />}
                      <span>{selectedThread.title}</span>
                    </h3>
                    
                    <div className="flex gap-2">
                      {(user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'hod') && (
                        <button 
                          onClick={() => handleTogglePin(selectedThread._id)}
                          className="btn-secondary btn-icon text-slate-400 hover:text-amber-500"
                          title="Pin Thread"
                        >
                          <Pin className={`h-4 w-4 ${selectedThread.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      )}
                      {(user?.id === selectedThread.author?._id || user?.role === 'teacher' || user?.role === 'admin') && (
                        <button 
                          onClick={() => handleDeleteThread(selectedThread._id)}
                          className="btn-secondary btn-icon text-slate-400 hover:text-red-500"
                          title="Delete Thread"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedThread.content}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-[10px]">
                        {selectedThread.author?.name?.[0].toUpperCase()}
                      </div>
                      <span>
                        Posted by <strong>{selectedThread.author?.name}</strong> ({selectedThread.author?.role}) · {new Date(selectedThread.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleUpvoteThread(selectedThread._id)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-all ${
                        selectedThread.upvotes?.includes(user?.id)
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{selectedThread.upvotes?.length || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Replies list */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Replies ({selectedThread.replies?.length || 0})</h4>
                  
                  {selectedThread.replies?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No answers yet. Share your knowledge or clarify the doubt!</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedThread.replies.map((reply) => (
                        <div key={reply._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs relative space-y-2">
                          <p className="text-slate-800 leading-relaxed">{reply.content}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-450 border-t border-slate-100/50 pt-2">
                            <span className="font-medium text-slate-500">
                              By {reply.author?.name} ({reply.author?.role}) · {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post reply box */}
                <form onSubmit={handlePostReply} className="flex gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Type your response here..."
                    className="form-input text-xs"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary shrink-0 px-4 py-2 flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" />
                    <span>Reply</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Topic list */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">All Discussions</h4>
                  <span className="badge-blue text-[10px]">{threads.length} topics</span>
                </div>

                {threads.length === 0 ? (
                  <div className="card p-10 text-center">
                    <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No active discussions. Post a question to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {threads.map((thread) => (
                      <div 
                        key={thread._id} 
                        onClick={() => setSelectedThread(thread)}
                        className={`card card-hover p-5 cursor-pointer relative ${
                          thread.isPinned ? 'border-l-4 border-l-amber-500 border-indigo-100 bg-indigo-50/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm leading-snug flex items-center gap-1.5 flex-wrap">
                              {thread.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                              <span>{thread.title}</span>
                            </h4>
                            <p className="text-xs text-slate-450 line-clamp-1 leading-normal">{thread.content}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0 text-slate-450 text-xs">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" />
                              {thread.upvotes?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3.5 w-3.5" />
                              {thread.replies?.length || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100/50">
                          <span>
                            Posted by <strong>{thread.author?.name}</strong> · {new Date(thread.createdAt).toLocaleDateString()}
                          </span>
                          {thread.replies?.length > 0 && (
                            <span className="text-indigo-650 font-semibold">
                              Last reply: {new Date(thread.replies[thread.replies.length - 1].createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New Topic Creation Form (Right Sidebar) */}
          <div className="space-y-4">
            <div className="card p-5 bg-slate-50/60 border-slate-200/60">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
                <span>Start New Discussion</span>
              </h3>
              
              <form onSubmit={handleCreateThread} className="space-y-4">
                <div className="space-y-1">
                  <label className="form-label">Post Title</label>
                  <input
                    type="text"
                    placeholder="Briefly state your topic..."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs focus:outline-none focus:border-indigo-500"
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="form-label">Message Details</label>
                  <textarea
                    placeholder="Elaborate your query or announcement..."
                    className="w-full px-3 py-2 border rounded-xl bg-white text-xs h-28 resize-none focus:outline-none focus:border-indigo-500"
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isPosting}
                  className="btn-primary w-full py-2 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Publish Topic</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Class Roster Tab */
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-700">Enrolled Students</h4>
            <span className="badge-blue">{roster.length} participants</span>
          </div>

          {rosterLoading ? (
            <div className="flex justify-center py-12"><div className="spinner" /></div>
          ) : roster.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No students enrolled yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-head">
                  <tr>
                    <th className="table-th text-left pl-5">Student</th>
                    <th className="table-th text-left">Email Address</th>
                    <th className="table-th text-left">Semester</th>
                    <th className="table-th text-left">Registration Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((r, i) => (
                    <tr key={r.enrollmentId || i} className="table-row-hover">
                      <td className="table-td font-semibold text-slate-800 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {r.student?.name?.[0].toUpperCase()}
                          </div>
                          <span>{r.student?.name}</span>
                        </div>
                      </td>
                      <td className="table-td text-slate-500 text-xs">
                        {r.student?.email}
                      </td>
                      <td className="table-td text-slate-500 text-xs font-semibold">
                        S-{r.student?.semester || 1}
                      </td>
                      <td className="table-td">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-250 text-emerald-600">
                          {r.status || 'Enrolled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
