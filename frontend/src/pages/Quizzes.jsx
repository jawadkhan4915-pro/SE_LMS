import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { Award, Clock, HelpCircle, CheckCircle, AlertCircle, Play } from 'lucide-react';

const Quizzes = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({}); // quizId: attempt record
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Active quiz attempt states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId: selectedIndex
  const [timer, setTimer] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Result display
  const [result, setResult] = useState(null);

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

      const attemptMap = {};
      await Promise.all(
        quizRes.data.data.map(async (qz) => {
          try {
            const attRes = await api.get(`/quizzes/${qz._id}/my-attempt`);
            if (attRes.data.success) {
              attemptMap[qz._id] = attRes.data.data;
            }
          } catch (e) {
            attemptMap[qz._id] = null;
          }
        })
      );
      setAttempts(attemptMap);
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

  // Start attempt
  const handleStartQuiz = async (quiz) => {
    try {
      setLoading(true);
      const qRes = await api.get(`/quizzes/${quiz._id}/questions`);
      setQuestions(qRes.data.data);
      setActiveQuiz(quiz);
      setAnswers({});
      setTimer(quiz.durationMinutes * 60);
      setResult(null);

      // Start timer countdown
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit when timer runs out
            handleQuizSubmit(quiz._id, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIndex) => {
    setAnswers({
      ...answers,
      [qId]: optionIndex
    });
  };

  const handleQuizSubmit = async (quizId, auto = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!auto && !window.confirm('Submit your answers now?')) return;

    setLoading(true);

    const formattedAnswers = Object.keys(answers).map(qId => ({
      questionId: qId,
      selectedAnswerIndex: answers[qId]
    }));

    try {
      const response = await api.post(`/quizzes/${quizId}/attempt`, {
        answers: formattedAnswers
      });
      setResult(response.data.data);
      setActiveQuiz(null);
      fetchQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && courses.length > 0 && quizzes.length === 0 && !activeQuiz) {
    return (
      <div className="flex h-64 items-center justify-center text-teal-400">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!activeQuiz && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Award className="h-6 w-6 text-teal-400" />
            <span>Class Assessment Quizzes</span>
          </h2>
        </div>
      )}

      {message && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* master screen lists */}
      {!activeQuiz && !result && (
        courses.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No registered courses. No assessments available.</div>
        ) : (
          <div className="space-y-5">
            <div className="glass-card p-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Course</label>
              <select
                className="max-w-xs w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.code} • {course.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {quizzes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 glass-card">No quizzes published for this class module.</div>
              ) : (
                quizzes.map((qz) => {
                  const attempt = attempts[qz._id];
                  
                  return (
                    <div key={qz._id} className="glass-card p-5 flex items-center justify-between hover:border-teal-500/15">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-200">{qz.title}</h4>
                        <div className="flex gap-4 text-[10px] text-slate-500 font-semibold uppercase">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-indigo-400" /> {qz.durationMinutes} Mins</span>
                          <span>Passing Marks: {qz.passingMarks}</span>
                        </div>
                      </div>

                      <div>
                        {attempt ? (
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              attempt.passed ? 'bg-teal-500/5 text-teal-400 border border-teal-500/10' :
                              'bg-rose-500/5 text-rose-400 border border-rose-500/10'
                            }`}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-1">Score: {attempt.score}</span>
                          </div>
                        ) : qz.isActive ? (
                          <button
                            onClick={() => handleStartQuiz(qz)}
                            className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Play className="h-3.5 w-3.5 fill-slate-950" />
                            <span>Attempt Quiz</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-semibold bg-slate-900 border border-slate-800/80 px-3 py-1 rounded-lg">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )
      )}

      {/* Timed quiz submission full screen module */}
      {activeQuiz && (
        <div className="min-h-[80vh] flex flex-col justify-between glass-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{activeQuiz.title}</h3>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Multiple Choice Questions</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-teal-400 font-extrabold text-sm">
              <Clock className="h-5 w-5 animate-pulse" />
              <span>{formatTime(timer)}</span>
            </div>
          </div>

          <div className="space-y-6 flex-1 max-w-3xl">
            {questions.map((q, qidx) => (
              <div key={q._id} className="space-y-3">
                <p className="text-sm font-bold text-slate-200">
                  Question {qidx + 1}: {q.text}
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {q.options.map((opt, oidx) => (
                    <button
                      key={oidx}
                      type="button"
                      onClick={() => handleSelectOption(q._id, oidx)}
                      className={`px-4 py-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        answers[q._id] === oidx
                          ? 'bg-teal-500/10 border-teal-500 text-teal-400 font-semibold shadow-inner'
                          : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-slate-500 mr-2 uppercase">{String.fromCharCode(97 + oidx)})</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={() => handleQuizSubmit(activeQuiz._id)}
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/10 transition-colors"
            >
              Submit Quiz Answers
            </button>
          </div>
        </div>
      )}

      {/* Result Display View */}
      {result && (
        <div className="max-w-md mx-auto glass-card p-8 text-center space-y-6 flex flex-col items-center">
          <div>
            <span className="text-[10px] text-teal-400 font-bold bg-teal-500/5 border border-teal-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Attempt Completed
            </span>
            <h3 className="text-xl font-bold text-slate-100 mt-3">Your Quiz Score Summary</h3>
          </div>

          {result.passed ? (
            <div className="flex flex-col items-center gap-2 p-6 bg-teal-500/5 border border-teal-500/10 rounded-2xl w-full text-teal-400">
              <CheckCircle className="h-12 w-12" />
              <p className="font-bold text-sm">Congratulations! You Passed</p>
              <p className="text-3xl font-extrabold text-white mt-2">{result.score} / {result.totalQuestions}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl w-full text-rose-400">
              <AlertCircle className="h-12 w-12" />
              <p className="font-bold text-sm">Failed to Pass Threshold</p>
              <p className="text-3xl font-extrabold text-white mt-2">{result.score} / {result.totalQuestions}</p>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Required Passing score: {result.passingMarks}</span>
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Return to Assessments
          </button>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
