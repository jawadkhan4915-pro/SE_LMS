import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Award, Plus, CheckCircle, Info, Calendar, Clock, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const ManageQuizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Modals state
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [isAttemptsOpen, setIsAttemptsOpen] = useState(false);
  
  // Selection
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);

  // Create Quiz states
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('20');
  const [passingMarks, setPassingMarks] = useState('5');

  // Create Question states
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctIdx, setCorrectIdx] = useState('0');

  const fetchCoursesAndQuizzes = async () => {
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

  const fetchQuizzes = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const quizRes = await api.get(`/quizzes/course/${selectedCourseId}`);
      setQuizzes(quizRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndQuizzes();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCourseId]);

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!title || !durationMinutes || !passingMarks) return;

    try {
      await api.post('/quizzes', {
        courseId: selectedCourseId,
        title,
        durationMinutes: Number(durationMinutes),
        passingMarks: Number(passingMarks)
      });
      setMessage('Quiz assessment published successfully.');
      setTitle('');
      setIsQuizOpen(false);
      fetchQuizzes();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed');
    }
  };

  const handleToggleStatus = async (quizId) => {
    try {
      const res = await api.put(`/quizzes/${quizId}/toggle`);
      setMessage(res.data.message);
      fetchQuizzes();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleOpenAddQuestion = (quiz) => {
    setSelectedQuiz(quiz);
    setIsQuestionOpen(true);
  };

  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!qText || !optA || !optB || !optC || !optD) {
      alert('Please fill in question text and all 4 options');
      return;
    }

    try {
      await api.post(`/quizzes/${selectedQuiz._id}/questions`, {
        questions: [
          {
            text: qText,
            options: [optA, optB, optC, optD],
            correctAnswerIndex: Number(correctIdx)
          }
        ]
      });
      setMessage('Question added to pool.');
      setQText('');
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setCorrectIdx('0');
      setIsQuestionOpen(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleViewAttempts = async (quiz) => {
    setSelectedQuiz(quiz);
    setIsAttemptsOpen(true);
    try {
      const attRes = await api.get(`/quizzes/${quiz._id}/attempts`);
      setAttempts(attRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && courses.length > 0 && quizzes.length === 0) {
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
          <Award className="h-6 w-6 text-teal-400" />
          <span>Manage Course Quizzes</span>
        </h2>
        {courses.length > 0 && (
          <button 
            onClick={() => setIsQuizOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-teal-500/10"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Quiz Setup</span>
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
        <div className="text-center py-12 text-slate-500">No courses assigned to manage quizzes.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Selector */}
          <div className="glass-card p-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Course</label>
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

          {/* Quizzes lists */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-slate-400 border-b border-slate-800 pb-2">Active Assessments</h3>
            {quizzes.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center glass-card">No quizzes published yet.</p>
            ) : (
              quizzes.map((qz) => (
                <div key={qz._id} className="glass-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-teal-500/15">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-200">{qz.title}</h4>
                    <div className="flex gap-4 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        {qz.durationMinutes} Mins
                      </span>
                      <span>Passing Score: {qz.passingMarks}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Toggle activation check */}
                    <button
                      onClick={() => handleToggleStatus(qz._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        qz.isActive
                          ? 'bg-teal-500/5 text-teal-400 border-teal-500/25 hover:bg-teal-500/10'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {qz.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      <span>{qz.isActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenAddQuestion(qz)}
                      className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold rounded-lg transition-colors"
                    >
                      Add MCQs
                    </button>

                    <button
                      onClick={() => handleViewAttempts(qz)}
                      className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Scoresheet</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Quiz Modal Popup */}
      {isQuizOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleCreateQuiz}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Create Quiz Assessment</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g. Midterm 1: Deep Learning Foundations"
                className="form-input text-xs"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Duration (Minutes)</label>
                <input
                  type="number"
                  className="form-input text-xs"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Passing Marks Threshold</label>
                <input
                  type="number"
                  className="form-input text-xs"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsQuizOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl flex-1 shadow-lg shadow-teal-500/10"
              >
                Publish Quiz
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Question Modal Popup */}
      {isQuestionOpen && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form 
            onSubmit={handleAddQuestionSubmit}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3">Add MCQ: {selectedQuiz.title}</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Question Prompt Text *</label>
              <input
                type="text"
                placeholder="e.g. Which activation function suffers from vanishing gradient problem?"
                className="form-input text-xs"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Option A *</label>
                <input
                  type="text"
                  placeholder="Option A"
                  className="form-input text-xs py-2"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Option B *</label>
                <input
                  type="text"
                  placeholder="Option B"
                  className="form-input text-xs py-2"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Option C *</label>
                <input
                  type="text"
                  placeholder="Option C"
                  className="form-input text-xs py-2"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Option D *</label>
                <input
                  type="text"
                  placeholder="Option D"
                  className="form-input text-xs py-2"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Correct Answer Index</label>
              <select
                className="w-full px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                value={correctIdx}
                onChange={(e) => setCorrectIdx(e.target.value)}
              >
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>
            </div>

            <div className="flex gap-3 pt-3">
              <button 
                type="button"
                onClick={() => setIsQuestionOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex-1"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl flex-1 shadow-lg"
              >
                Save MCQ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Attempts Modal Popup */}
      {isAttemptsOpen && selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[85vh]">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Attempts Scoresheet: {selectedQuiz.title}</h3>
            <p className="text-xs text-slate-500 mb-4 border-b border-slate-800 pb-3">Auto graded student results list</p>
            
            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1">
              {attempts.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center">No student attempts recorded yet.</p>
              ) : (
                attempts.map((att) => (
                  <div key={att._id} className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs hover:border-teal-500/10">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-200">{att.student?.name}</p>
                      <p className="text-slate-500">{att.student?.email} • semester {att.student?.semester}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        att.passed ? 'bg-teal-500/5 text-teal-400 border border-teal-500/10' :
                        'bg-rose-500/5 text-rose-400 border border-rose-500/10'
                      }`}>
                        {att.passed ? 'Passed' : 'Failed'}
                      </span>
                      <p className="font-bold text-slate-300 mt-1">Score: {att.score}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setIsAttemptsOpen(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuizzes;
