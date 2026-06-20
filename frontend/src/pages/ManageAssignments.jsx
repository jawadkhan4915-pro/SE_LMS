import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { FileText, Plus, CheckCircle, Info, ExternalLink, Calendar, Check } from 'lucide-react';

const ManageAssignments = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Submissions state
  const [selectedAsg, setSelectedAsg] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  
  // Grading form state
  const [gradingSubId, setGradingSubId] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  // Create Assignment form state
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchCoursesAndAssignments = async () => {
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

  const fetchAssignments = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const assignRes = await api.get(`/assignments/course/${selectedCourseId}`);
      setAssignments(assignRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndAssignments();
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [selectedCourseId]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !description || !deadline) {
      alert('Please complete all assignment properties');
      return;
    }

    try {
      await api.post('/assignments', {
        courseId: selectedCourseId,
        title,
        description,
        deadline
      });
      setMessage('Assignment successfully published to students.');
      setTitle('');
      setDescription('');
      setDeadline('');
      setIsOpen(false);
      fetchAssignments();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed');
    }
  };

  const handleViewSubmissions = async (asg) => {
    setSelectedAsg(asg);
    try {
      const subRes = await api.get(`/assignments/${asg._id}/submissions`);
      setSubmissions(subRes.data.data);
    } catch (err) {
      console.error('Error fetching submissions', err);
    }
  };

  const handleOpenGrade = (sub) => {
    setGradingSubId(sub._id);
    setGrade(sub.grade !== null ? sub.grade.toString() : '');
    setFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (subId) => {
    if (grade === '' || Number(grade) < 0 || Number(grade) > 100) {
      alert('Please supply a score between 0 and 100');
      return;
    }

    try {
      await api.put(`/assignments/submission/${subId}/grade`, {
        grade: Number(grade),
        feedback
      });
      setGradingSubId(null);
      
      // Refresh list
      const subRes = await api.get(`/assignments/${selectedAsg._id}/submissions`);
      setSubmissions(subRes.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Grading failed');
    }
  };

  if (loading && courses.length > 0 && assignments.length === 0) {
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
          <FileText className="h-6 w-6 text-teal-400" />
          <span>Manage Course Assignments</span>
        </h2>
        {courses.length > 0 && (
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Assignment</span>
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
        <div className="text-center py-12 text-slate-500">No assigned courses to manage assignments.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* selector panel */}
          <div className="glass-card p-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Course</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.code} • {course.name}</option>
              ))}
            </select>
          </div>

          {/* Assignments Published lists */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-400 border-b border-slate-800 pb-2">Active Task List</h3>
            {assignments.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center glass-card">No assignments published yet.</p>
            ) : (
              assignments.map((asg) => (
                <div key={asg._id} className="glass-card p-5 flex items-center justify-between hover:border-teal-500/15">
                  <div className="space-y-1 max-w-md">
                    <h4 className="font-bold text-sm text-slate-200">{asg.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{asg.description}</p>
                    <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Due: {new Date(asg.deadline).toLocaleDateString()}</p>
                  </div>

                  <button
                    onClick={() => handleViewSubmissions(asg)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Info className="h-4 w-4" />
                    <span>Grading sheet</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Assignment Modal Popup */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleCreateAssignment}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5"
          >
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Create Course Assignment</h3>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Assignment Title</label>
              <input
                type="text"
                placeholder="e.g. Lab Task 2: Linear Regression"
                className="form-input text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Instructions / Details</label>
              <textarea
                placeholder="Provide task descriptions and constraints..."
                className="form-input text-xs min-h-24 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Submission Deadline</label>
              <input
                type="datetime-local"
                className="form-input text-sm"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl flex-1 shadow-lg shadow-teal-500/10"
              >
                Publish Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions Modal Popup */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Submissions: {selectedAsg.title}</h3>
            <p className="text-xs text-slate-400 mb-4 border-b border-slate-800 pb-3">Review PDF uploads, post scores and feedback comments</p>
            
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-6">
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center">No student submissions uploaded yet.</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub._id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">{sub.student?.name}</p>
                        <p className="text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                      </div>
                      
                      <a 
                        href={`http://localhost:5000${sub.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-teal-400 hover:text-teal-300 font-bold"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open Document</span>
                      </a>
                    </div>

                    {/* Grading Details or Input */}
                    {gradingSubId === sub._id ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 items-end">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Score (Max 100)</label>
                          <input
                            type="number"
                            className="form-input text-xs py-2"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2 flex gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] text-slate-500 font-bold uppercase">Feedback Comments</label>
                            <input
                              type="text"
                              className="form-input text-xs py-2"
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Good analysis, work on presentation."
                            />
                          </div>
                          <button
                            onClick={() => handleSaveGrade(sub._id)}
                            className="h-10 w-10 shrink-0 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl flex items-center justify-center font-bold"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-800/40 pt-3 flex justify-between items-center text-xs">
                        <div>
                          <p className="text-slate-400">
                            Grade: <span className="font-bold text-slate-200">{sub.grade !== null ? `${sub.grade} / 100` : 'Ungraded'}</span>
                          </p>
                          {sub.feedback && <p className="text-[10px] text-slate-500 italic mt-0.5">Feedback: {sub.feedback}</p>}
                        </div>
                        <button
                          onClick={() => handleOpenGrade(sub)}
                          className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                        >
                          {sub.grade !== null ? 'Re-grade' : 'Grade Task'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setSelectedAsg(null)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl w-full"
            >
              Close Submissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssignments;
