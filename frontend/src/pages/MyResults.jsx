import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Award, Download, FileSpreadsheet, ShieldAlert, 
  BookOpen, Calculator, Calendar, GraduationCap, Printer 
} from 'lucide-react';

const MyResults = () => {
  const [groupedResults, setGroupedResults] = useState({});
  const [rawResults, setRawResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results/my');
        setGroupedResults(res.data.grouped || {});
        setRawResults(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load semester results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Calculate SGPA for a specific semester
  const calculateSGPA = (semesterResults) => {
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    semesterResults.forEach(r => {
      const credits = r.course?.creditHours || 3;
      const gp = r.gradePoints || 0.0;
      totalGradePoints += gp * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
  };

  // Calculate overall CGPA
  const calculateCGPA = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;

    rawResults.forEach(r => {
      const credits = r.course?.creditHours || 3;
      const gp = r.gradePoints || 0.0;
      totalGradePoints += gp * credits;
      totalCredits += credits;
    });

    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
  };

  const calculateTotalCredits = () => {
    return rawResults.reduce((acc, r) => acc + (r.course?.creditHours || 3), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const semesters = Object.keys(groupedResults).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          main, .printable-transcript {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            width: 100% !important;
          }
          .printable-transcript {
            visibility: visible !important;
            display: block !important;
          }
        }
      `}} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="page-title">My Transcript & Results</h1>
          <p className="page-subtitle">View and download your official academic record for all semesters</p>
        </div>
        {semesters.length > 0 && (
          <button 
            onClick={handlePrint}
            className="btn-primary flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Printer className="h-4 w-4" />
            <span>Print Transcript</span>
          </button>
        )}
      </div>

      {error && (
        <div className="alert-error no-print">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {semesters.length === 0 ? (
        <div className="card p-12 text-center no-print">
          <Award className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">No exam results published yet.</p>
          <p className="text-slate-400 text-xs mt-1">Midterm and Final Term results will appear here once uploaded by the instructor.</p>
        </div>
      ) : (
        <div className="space-y-6 printable-transcript">
          {/* CGPA Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-r from-indigo-600 to-indigo-850 p-6 rounded-2xl text-white shadow-sm border border-indigo-700/10">
            <div>
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider block">Cumulative CGPA</span>
              <span className="text-4xl font-black mt-1 block">{calculateCGPA()}</span>
            </div>
            <div>
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider block">Total Enrolled Semesters</span>
              <span className="text-4xl font-black mt-1 block">{semesters.length}</span>
            </div>
            <div>
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider block">Completed Credit Hours</span>
              <span className="text-4xl font-black mt-1 block">{calculateTotalCredits()} cr</span>
            </div>
          </div>

          {/* Results per Semester */}
          {semesters.map((sem) => {
            const semesterResults = groupedResults[sem];
            const sgpa = calculateSGPA(semesterResults);

            return (
              <div key={sem} className="card overflow-hidden border border-slate-200 shadow-sm">
                {/* Semester Summary Sub-bar */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-extrabold text-slate-800 text-base">Semester {sem}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Semester SGPA:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-extrabold">
                      {sgpa}
                    </span>
                  </div>
                </div>

                {/* Course List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Code</th>
                        <th className="px-5 py-3">Course Title</th>
                        <th className="px-5 py-3 text-center">Credit Hours</th>
                        <th className="px-5 py-3 text-center">Midterm (30)</th>
                        <th className="px-5 py-3 text-center">Final (50)</th>
                        <th className="px-5 py-3 text-center">Sessional (20)</th>
                        <th className="px-5 py-3 text-center">Total (100)</th>
                        <th className="px-5 py-3 text-center">Grade</th>
                        <th className="px-5 py-3 text-center">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {semesterResults.map((r, i) => (
                        <tr key={i} className="table-row-hover text-slate-700">
                          <td className="px-5 py-3.5 font-bold text-indigo-600">{r.course?.code}</td>
                          <td className="px-5 py-3.5 font-semibold text-slate-800">{r.course?.name}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{r.course?.creditHours || 3}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{r.midterm}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{r.finalterm}</td>
                          <td className="px-5 py-3.5 text-center font-medium">{r.sessional}</td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-900">{r.totalMarks}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              r.grade.includes('F') ? 'bg-red-50 text-red-600 border border-red-200' :
                              r.grade.includes('A') ? 'bg-emerald-50 text-emerald-600 border border-emerald-250' :
                              'bg-indigo-50 text-indigo-600 border border-indigo-200'
                            }`}>
                              {r.grade}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                            {r.gradePoints?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyResults;
