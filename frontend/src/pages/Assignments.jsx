import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  FileText, Calendar, Upload, CheckCircle, AlertCircle, Clock, Award, Filter
} from 'lucide-react';

const Assignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const fetchCourses = async () => {
    try {
      const r = await api.get('/courses');
      setCourses(r.data.data);
      if (r.data.data.length > 0) setSelectedCourseId(r.data.data[0]._id);
      else setLoading(false);
    } catch (e) { console.error(e); setLoading(false); }
  };

  const fetchAssignments = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const ar = await api.get(`/assignments/course/${selectedCourseId}`);
      setAssignments(ar.data.data);
      const subMap = {};
      await Promise.all(ar.data.data.map(async a => {
        try {
          const sr = await api.get(`/assignments/${a._id}/my-submission`);
          subMap[a._id] = sr.data.success ? sr.data.data : null;
        } catch { subMap[a._id] = null; }
      }));
      setSubmissions(subMap);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { fetchAssignments(); }, [selectedCourseId]);

  const handleSubmit = async (asgId) => {
    if (!selectedFile) { showMsg('Please select a file first', 'error'); return; }
    const fd = new FormData();
    fd.append('file', selectedFile);
    try {
      setLoading(true);
      await api.post(`/assignments/${asgId}/submit`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showMsg('Assignment submitted successfully!');
      setSelectedFile(null); setUploadingId(null);
      fetchAssignments();
    } catch (e) { showMsg(e.response?.data?.message || 'Submission failed', 'error'); }
    finally { setLoading(false); }
  };

  if (loading && courses.length > 0 && assignments.length === 0) return (
    <div className="flex h-64 items-center justify-center"><div className="spinner" /></div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Assignments</h1>
        <p className="page-subtitle">{assignments.length} assignments in selected course</p>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'alert-error' : 'alert-success'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Course Selector */}
          <div className="card p-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0">Course:</label>
            <select
              className="form-select flex-1 max-w-sm py-2 text-sm"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          {/* Assignment Cards */}
          {assignments.length === 0 ? (
            <div className="card p-10 text-center">
              <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No assignments published for this course yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map(asg => {
                const sub = submissions[asg._id];
                const isOverdue = new Date(asg.deadline) < new Date();
                const daysLeft = Math.ceil((new Date(asg.deadline) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={asg._id} className="card p-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{asg.title}</h3>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            Due: {new Date(asg.deadline).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          {!isOverdue && !sub && (
                            <span className={`flex items-center gap-1 text-xs font-semibold ${daysLeft <= 1 ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              <Clock className="h-3 w-3" />
                              {daysLeft > 0 ? `${daysLeft}d left` : 'Due today'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      {sub ? (
                        <span className="badge-green"><CheckCircle className="h-3 w-3" /> Submitted</span>
                      ) : isOverdue ? (
                        <span className="badge-red"><AlertCircle className="h-3 w-3" /> Overdue</span>
                      ) : (
                        <span className="badge-amber"><Clock className="h-3 w-3" /> Pending</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{asg.description}</p>

                    {/* Submission Section */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        {sub ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submission</p>
                            <p className="text-sm font-bold text-emerald-600">{sub.fileName || 'File submitted'}</p>
                            {sub.grade !== null && sub.grade !== undefined ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Award className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm font-bold text-indigo-700">Grade: {sub.grade}/100</span>
                                {sub.feedback && <span className="text-xs text-slate-500 italic">· {sub.feedback}</span>}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Awaiting grading...</span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submission</p>
                            <p className="text-sm text-slate-400">{isOverdue ? 'Deadline passed.' : 'Not submitted yet.'}</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Control */}
                      {!sub && !isOverdue && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="btn-secondary btn-sm cursor-pointer">
                            <Upload className="h-3.5 w-3.5" />
                            {uploadingId === asg._id && selectedFile ? selectedFile.name.slice(0, 20) + '...' : 'Choose File'}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx,.doc,.zip"
                              onChange={e => { setSelectedFile(e.target.files[0]); setUploadingId(asg._id); }}
                            />
                          </label>
                          {uploadingId === asg._id && selectedFile && (
                            <button onClick={() => handleSubmit(asg._id)} className="btn-success btn-sm">
                              <CheckCircle className="h-3.5 w-3.5" /> Submit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Assignments;
