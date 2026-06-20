import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Award, AlertCircle, FileText, CheckSquare, 
  UserSquare2, Star, Percent, MessageSquare 
} from 'lucide-react';

const SessionalMarks = () => {
  const [sessionalList, setSessionalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessional = async () => {
      try {
        const res = await api.get('/sessional/my');
        setSessionalList(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load sessional marks.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessional();
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="page-title">Sessional Marks</h1>
        <p className="page-subtitle">Track your continuous assessment marks (Quizzes, Assignments, Presentations) out of 20</p>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {sessionalList.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-slate-200">
          <Star className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">No sessional marks registered yet.</p>
          <p className="text-slate-400 text-xs mt-1">Your teachers will update sessional scores as quizzes and assignments are graded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessionalList.map((record) => {
            const pct = ((record.totalSessional / 20) * 100).toFixed(0);
            const pctColor = record.totalSessional >= 15 ? 'text-emerald-600' : record.totalSessional >= 10 ? 'text-indigo-650' : 'text-rose-600';
            const progressColor = record.totalSessional >= 15 ? 'bg-emerald-500' : record.totalSessional >= 10 ? 'bg-indigo-600' : 'bg-red-500';

            return (
              <div key={record._id} className="card p-6 flex flex-col justify-between border border-slate-200 bg-white">
                <div>
                  {/* Course info */}
                  <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                    <div>
                      <span className="badge-blue text-[10px] mb-1">{record.course?.code}</span>
                      <h3 className="font-extrabold text-slate-800 text-base leading-tight">{record.course?.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">Instructor: {record.teacher?.name || 'TBA'}</p>
                    </div>
                    {/* Visual Total score circle/percentage */}
                    <div className="text-right">
                      <span className={`text-2xl font-black block ${pctColor}`}>
                        {record.totalSessional} <span className="text-xs text-slate-400 font-medium">/ 20</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Sessional Score</span>
                    </div>
                  </div>

                  {/* Components */}
                  <div className="space-y-3.5 mt-4">
                    {/* Assignment 1 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-650 font-medium">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>Assignment 1</span>
                      </div>
                      <span className="font-bold text-slate-800">{record.assignment1} marks</span>
                    </div>

                    {/* Assignment 2 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-650 font-medium">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>Assignment 2</span>
                      </div>
                      <span className="font-bold text-slate-800">{record.assignment2} marks</span>
                    </div>

                    {/* Quiz 1 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-650 font-medium">
                        <CheckSquare className="h-4 w-4 text-slate-400" />
                        <span>Quiz 1</span>
                      </div>
                      <span className="font-bold text-slate-800">{record.quiz1} marks</span>
                    </div>

                    {/* Quiz 2 */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-650 font-medium">
                        <CheckSquare className="h-4 w-4 text-slate-400" />
                        <span>Quiz 2</span>
                      </div>
                      <span className="font-bold text-slate-800">{record.quiz2} marks</span>
                    </div>

                    {/* Presentation */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-slate-650 font-medium">
                        <UserSquare2 className="h-4 w-4 text-slate-400" />
                        <span>Class Presentation</span>
                      </div>
                      <span className="font-bold text-slate-800">{record.presentation} marks</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Remarks */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Total Sessional Completion</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${progressColor}`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>

                  {/* Remarks */}
                  {record.remarks && (
                    <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl flex items-start gap-2 text-xs">
                      <MessageSquare className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Instructor Notes</span>
                        <p className="text-slate-600 italic">"{record.remarks}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionalMarks;
