import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Award, AlertCircle, CheckCircle, Save, BookOpen, 
  HelpCircle, ChevronDown, ListTodo, Plus 
} from 'lucide-react';

const UploadResults = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId: { midterm, finalterm, sessional }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Helper to determine Grade points & Letter from total marks (out of 100)
  const getGradeInfo = (total) => {
    if (total >= 90) return 'A+';
    if (total >= 85) return 'A';
    if (total >= 80) return 'A-';
    if (total >= 75) return 'B+';
    if (total >= 70) return 'B';
    if (total >= 65) return 'B-';
    if (total >= 60) return 'C+';
    if (total >= 55) return 'C';
    if (total >= 50) return 'C-';
    if (total >= 45) return 'D';
    return 'F';
  };

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
      showMsg('Failed to load assigned courses.', 'error');
      setLoading(false);
    }
  };

  const fetchCourseRosterAndResults = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      // 1. Get roster
      const rosterRes = await api.get(`/courses/${selectedCourseId}/students`);
      const studentsList = rosterRes.data.data || [];
      setStudents(studentsList);

      // 2. Get existing results for this course
      const resultsRes = await api.get(`/results/course/${selectedCourseId}`);
      const existingResults = resultsRes.data.data || [];

      // 3. Prepopulate marks state
      const prepopulatedMarks = {};
      studentsList.forEach(s => {
        const studentId = s.student._id;
        const record = existingResults.find(r => r.student?._id === studentId || r.student === studentId);
        
        prepopulatedMarks[studentId] = {
          midterm: record ? record.midterm : 0,
          finalterm: record ? record.finalterm : 0,
          sessional: record ? record.sessional : 0
        };
      });
      setMarks(prepopulatedMarks);
    } catch (err) {
      console.error(err);
      showMsg('Failed to fetch class roster or results.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourseRosterAndResults();
  }, [selectedCourseId]);

  const handleMarkChange = (studentId, field, val) => {
    const numericVal = Math.max(0, parseInt(val) || 0);
    // Boundary checks
    let max = 100;
    if (field === 'midterm') max = 30;
    if (field === 'finalterm') max = 50;
    if (field === 'sessional') max = 20;

    const validatedVal = Math.min(numericVal, max);

    setMarks({
      ...marks,
      [studentId]: {
        ...marks[studentId],
        [field]: validatedVal
      }
    });
  };

  const handleBulkSave = async () => {
    setSubmitting(true);
    try {
      const course = courses.find(c => c._id === selectedCourseId);
      const semester = course?.semester || 1;
      
      const payload = {
        courseId: selectedCourseId,
        semester,
        academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        results: Object.keys(marks).map(studentId => ({
          studentId,
          midterm: marks[studentId].midterm,
          finalterm: marks[studentId].finalterm,
          sessional: marks[studentId].sessional
        }))
      };

      await api.post('/results/bulk', payload);
      showMsg('All student results have been successfully uploaded and published!', 'success');
      fetchCourseRosterAndResults();
    } catch (err) {
      console.error(err);
      showMsg(err.response?.data?.message || 'Failed to upload student results.', 'error');
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
          <h1 className="page-title">Manage Exam Results</h1>
          <p className="page-subtitle">Upload Midterm, Finalterm, and Sessional grades for assigned courses</p>
        </div>
        {students.length > 0 && (
          <button
            onClick={handleBulkSave}
            disabled={submitting}
            className="btn-primary flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-indigo-500/10"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{submitting ? 'Saving...' : 'Publish Results'}</span>
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
        <div className="text-center py-12 text-slate-400 font-semibold card">No courses assigned to upload results.</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 items-start">
          {/* Selector Panel */}
          <div className="card p-5 space-y-4">
            <div>
              <label className="form-label block mb-2">Teaching Course Class</label>
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
                <span>Marking Schema</span>
              </h4>
              <p>Please enter marks according to the university guidelines:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Mid-Term Exam: <strong className="text-slate-700">Max 30 marks</strong></li>
                <li>Final Term Exam: <strong className="text-slate-700">Max 50 marks</strong></li>
                <li>Sessional score: <strong className="text-slate-700">Max 20 marks</strong></li>
              </ul>
              <p className="text-[10px] text-indigo-500 italic mt-2 font-medium">Auto-grading calculates cumulative marks (Max 100) and displays corresponding letter grade.</p>
            </div>
          </div>

          {/* Results Sheet table grid */}
          <div className="lg:col-span-3 card overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm">Grading Ledger Matrix</h3>
              <span className="badge-blue font-bold">{students.length} Students</span>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-450 py-12 text-center">No students registered in this class.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-550 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3 text-center w-24">Mid Term (30)</th>
                      <th className="px-4 py-3 text-center w-24">Final Term (50)</th>
                      <th className="px-4 py-3 text-center w-24">Sessional (20)</th>
                      <th className="px-4 py-3 text-center w-24">Total (100)</th>
                      <th className="px-4 py-3 text-center w-20">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {students.map((r) => {
                      const studentId = r.student._id;
                      const studentMarks = marks[studentId] || { midterm: 0, finalterm: 0, sessional: 0 };
                      const total = studentMarks.midterm + studentMarks.finalterm + studentMarks.sessional;
                      const letterGrade = getGradeInfo(total);

                      return (
                        <tr key={studentId} className="table-row-hover text-slate-700">
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-bold text-slate-800 text-sm block">{r.student.name}</span>
                              <span className="text-slate-400 block">{r.student.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                              value={studentMarks.midterm}
                              onChange={(e) => handleMarkChange(studentId, 'midterm', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                              value={studentMarks.finalterm}
                              onChange={(e) => handleMarkChange(studentId, 'finalterm', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              className="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                              value={studentMarks.sessional}
                              onChange={(e) => handleMarkChange(studentId, 'sessional', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3 text-center font-black text-slate-900 text-sm">
                            {total}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-wider ${
                              letterGrade === 'F' ? 'bg-red-50 text-red-600 border border-red-200' :
                              letterGrade.includes('A') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            }`}>
                              {letterGrade}
                            </span>
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

export default UploadResults;
