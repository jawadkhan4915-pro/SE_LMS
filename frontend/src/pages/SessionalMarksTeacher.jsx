import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Award, AlertCircle, CheckCircle, Save, 
  HelpCircle, ChevronDown, ListTodo, BookOpen 
} from 'lucide-react';

const SessionalMarksTeacher = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [sessionalData, setSessionalData] = useState({}); // studentId: { assignment1, assignment2, quiz1, quiz2, presentation, remarks }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data || []);
      if (res.data.data.length > 0) {
        setSelectedCourseId(res.data.data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      showMsg('Failed to load courses.', 'error');
      setLoading(false);
    }
  };

  const fetchCourseSessionalData = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      // 1. Fetch class students
      const rosterRes = await api.get(`/courses/${selectedCourseId}/students`);
      const studentsList = rosterRes.data.data || [];
      setStudents(studentsList);

      // 2. Fetch existing sessionals
      const sessionalRes = await api.get(`/sessional/course/${selectedCourseId}`);
      const existingRecords = sessionalRes.data.data || [];

      // 3. Prepopulate state
      const prepopulated = {};
      studentsList.forEach(s => {
        const studentId = s.student._id;
        const record = existingRecords.find(r => r.student?._id === studentId || r.student === studentId);

        prepopulated[studentId] = {
          assignment1: record ? record.assignment1 : 0,
          assignment2: record ? record.assignment2 : 0,
          quiz1: record ? record.quiz1 : 0,
          quiz2: record ? record.quiz2 : 0,
          presentation: record ? record.presentation : 0,
          remarks: record ? record.remarks : ''
        };
      });
      setSessionalData(prepopulated);
    } catch (err) {
      console.error(err);
      showMsg('Failed to load class roster or assessment marks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourseSessionalData();
  }, [selectedCourseId]);

  const handleScoreChange = (studentId, field, val) => {
    if (field === 'remarks') {
      setSessionalData({
        ...sessionalData,
        [studentId]: {
          ...sessionalData[studentId],
          remarks: val
        }
      });
      return;
    }

    // Otherwise numeric constraint
    const numericVal = Math.max(0, parseFloat(val) || 0);
    // Standard component weight: max 5 marks (since sum is 20, or custom, let's allow up to 10 max per single field but keep soft limit)
    const validatedVal = Math.min(numericVal, 20);

    setSessionalData({
      ...sessionalData,
      [studentId]: {
        ...sessionalData[studentId],
        [field]: validatedVal
      }
    });
  };

  const handleSaveAll = async () => {
    setSubmitting(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        students: Object.keys(sessionalData).map(studentId => ({
          studentId,
          assignment1: sessionalData[studentId].assignment1,
          assignment2: sessionalData[studentId].assignment2,
          quiz1: sessionalData[studentId].quiz1,
          quiz2: sessionalData[studentId].quiz2,
          presentation: sessionalData[studentId].presentation,
          remarks: sessionalData[studentId].remarks
        }))
      };

      await api.post('/sessional/bulk', payload);
      showMsg('Sessional marks registry successfully updated and published.', 'success');
      fetchCourseSessionalData();
    } catch (err) {
      console.error(err);
      showMsg(err.response?.data?.message || 'Failed to save sessional marks.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && courses.length > 0 && students.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Manage Sessional Marks</h1>
          <p className="page-subtitle">Track continuous assessment components: Assignments, Quizzes, and Presentations</p>
        </div>
        {students.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={submitting}
            className="btn-primary flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-indigo-500/10"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{submitting ? 'Saving...' : 'Save Sessional Registry'}</span>
          </button>
        )}
      </div>

      {/* Message Notifications */}
      {message.text && (
        <div className={message.type === 'error' ? 'alert-error' : 'alert-success'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-semibold card">No courses assigned to manage sessional marks.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 items-start">
          {/* Guidelines Sidebar */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="form-label block mb-2">Select Course</label>
              <select
                className="form-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.code} • {course.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-2 text-slate-550 leading-relaxed">
              <h4 className="font-bold text-slate-700 uppercase flex items-center gap-1">
                <ListTodo className="h-4 w-4 text-indigo-500" />
                <span>Component Allocation</span>
              </h4>
              <p>Continuous internal assessment is capped at <strong className="text-slate-800">20 marks</strong>:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Assignments: Recommended max 5 marks each</li>
                <li>Quizzes: Recommended max 5 marks each</li>
                <li>Presentation: Recommended max 5 marks</li>
              </ul>
              <p className="text-[10px] text-indigo-500 italic mt-2 font-medium">Any sum exceeding 20 marks will be automatically capped at 20 in total scores.</p>
            </div>
          </div>

          {/* Sessional Spreadsheet Grid */}
          <div className="lg:col-span-3 card overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm">Sessional Marks Worksheet</h3>
              <span className="badge-blue font-bold">{students.length} Enrolled</span>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-450 py-12 text-center">No students registered in this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-550 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-2 py-3 text-center w-16">Asgn 1</th>
                      <th className="px-2 py-3 text-center w-16">Asgn 2</th>
                      <th className="px-2 py-3 text-center w-16">Quiz 1</th>
                      <th className="px-2 py-3 text-center w-16">Quiz 2</th>
                      <th className="px-2 py-3 text-center w-16">Pres.</th>
                      <th className="px-2 py-3 text-center w-16">Total</th>
                      <th className="px-4 py-3">Remarks / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {students.map((r) => {
                      const studentId = r.student._id;
                      const sRecord = sessionalData[studentId] || {
                        assignment1: 0, assignment2: 0, quiz1: 0, quiz2: 0, presentation: 0, remarks: ''
                      };
                      
                      // Calculate sessional total capped at 20
                      const total = Math.min(
                        sRecord.assignment1 + sRecord.assignment2 + sRecord.quiz1 + sRecord.quiz2 + sRecord.presentation,
                        20
                      );

                      return (
                        <tr key={studentId} className="table-row-hover text-slate-700">
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {r.student.name}
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="20"
                              className="w-12 px-1.5 py-1 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                              value={sRecord.assignment1}
                              onChange={(e) => handleScoreChange(studentId, 'assignment1', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="20"
                              className="w-12 px-1.5 py-1 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                              value={sRecord.assignment2}
                              onChange={(e) => handleScoreChange(studentId, 'assignment2', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="20"
                              className="w-12 px-1.5 py-1 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                              value={sRecord.quiz1}
                              onChange={(e) => handleScoreChange(studentId, 'quiz1', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="20"
                              className="w-12 px-1.5 py-1 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                              value={sRecord.quiz2}
                              onChange={(e) => handleScoreChange(studentId, 'quiz2', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="20"
                              className="w-12 px-1.5 py-1 text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                              value={sRecord.presentation}
                              onChange={(e) => handleScoreChange(studentId, 'presentation', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-3 text-center font-bold text-slate-800 text-sm">
                            {total}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 placeholder-slate-350"
                              placeholder="e.g. Good presentation performance"
                              value={sRecord.remarks}
                              onChange={(e) => handleScoreChange(studentId, 'remarks', e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionalMarksTeacher;
