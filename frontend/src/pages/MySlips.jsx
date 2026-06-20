import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  FileText, Download, Printer, ShieldAlert, 
  CreditCard, GraduationCap, Building2, Calendar, ClipboardCheck 
} from 'lucide-react';

const MySlips = () => {
  const [activeTab, setActiveTab] = useState('fee'); // 'fee' or 'rollnumber'
  const [feeData, setFeeData] = useState(null);
  const [rollNoData, setRollNoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSlips = async () => {
      setLoading(true);
      setError('');
      try {
        if (activeTab === 'fee') {
          const res = await api.get('/slips/fee');
          setFeeData(res.data.data);
        } else {
          const res = await api.get('/slips/rollnumber');
          setRollNoData(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load slip details. Please verify your enrollment is approved.');
      } finally {
        setLoading(false);
      }
    };
    fetchSlips();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Print-specific style override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside, header, nav, button, .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          main, .printable-slip {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            width: 100% !important;
          }
          .printable-slip {
            visibility: visible !important;
            display: block !important;
          }
        }
      `}} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="page-title">Slips & Vouchers</h1>
          <p className="page-subtitle">Download or print your official semester fee slip and roll number slips</p>
        </div>
        <button 
          onClick={handlePrint} 
          disabled={error}
          className="btn-primary flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab('fee')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === 'fee'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Semester Fee Slip</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('rollnumber')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === 'rollnumber'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Roll Number Slip</span>
          </div>
        </button>
      </div>

      {/* Error / Alert */}
      {error && (
        <div className="alert-error no-print">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Content Preview */}
      {!error && (
        <div className="card p-6 md:p-8 bg-white shadow-sm border border-slate-200 printable-slip max-w-4xl mx-auto">
          {activeTab === 'fee' && feeData && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">DEPARTMENT OF SOFTWARE ENGINEERING</h2>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">SE LMS fee voucher</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-600">
                    {feeData.status}
                  </span>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Voucher No: <span className="text-slate-800 font-bold">{feeData.voucherNo}</span></p>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">STUDENT NAME</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{feeData.student?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">ROLL NUMBER</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{feeData.student?.rollNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">SEMESTER / PROGRAM</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">Semester {feeData.semester} · BS SE</span>
                </div>
              </div>

              {/* Billing Info Table */}
              <div>
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2">Fees Breakdown</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Fee Category</th>
                        <th className="px-4 py-3 text-right">Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {feeData.feesBreakdown.map((item, idx) => (
                        <tr key={idx} className="text-slate-700">
                          <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium">{item.category}</td>
                          <td className="px-4 py-3 text-right font-semibold">Rs. {item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 text-sm">
                        <td colSpan="2" className="px-4 py-3.5 text-right">Total Payable Amount</td>
                        <td className="px-4 py-3.5 text-right text-indigo-700 font-extrabold">Rs. {feeData.totalAmount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bank Deposit instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                <div className="border border-indigo-100 bg-indigo-50/30 p-4 rounded-xl text-xs space-y-1.5">
                  <h4 className="font-bold text-indigo-800 uppercase flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Bank Deposit Details</span>
                  </h4>
                  <p className="text-slate-600 font-medium">Bank Name: <span className="text-slate-800 font-bold">{feeData.bankDetails?.bankName}</span></p>
                  <p className="text-slate-600 font-medium">Account No: <span className="text-slate-800 font-bold">{feeData.bankDetails?.accountNo}</span></p>
                  <p className="text-slate-600 font-medium">Account Title: <span className="text-slate-800 font-bold">{feeData.bankDetails?.title}</span></p>
                </div>
                <div className="border border-amber-100 bg-amber-50/30 p-4 rounded-xl text-xs space-y-1.5">
                  <h4 className="font-bold text-amber-800 uppercase flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Due Date & Guidelines</span>
                  </h4>
                  <p className="text-slate-600 font-medium">Due Date: <span className="text-red-600 font-bold">{feeData.dueDate}</span></p>
                  <p className="text-slate-500 leading-relaxed text-[11px]">Please deposit the due fee at any online HBL branch and upload/submit the stamped copy to the administration to avoid a late fee penalty of Rs. 1,000.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rollnumber' && rollNoData && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">DEPARTMENT OF SOFTWARE ENGINEERING</h2>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Midterm & Final Examination Roll Number Slip</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Session: <span className="text-slate-800 font-bold">{rollNoData.examSession}</span></p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Roll No: <span className="text-indigo-600 font-bold">{rollNoData.rollNumber}</span></p>
                </div>
              </div>

              {/* Student Details and Photo Box */}
              <div className="flex flex-col sm:flex-row gap-5 items-start justify-between bg-slate-50 p-5 rounded-xl border border-slate-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div>
                    <span className="text-slate-400 block font-medium">STUDENT NAME</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{rollNoData.student?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">DEPARTMENT / PROG.</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{rollNoData.student?.program || 'BS Software Engineering'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">SEMESTER</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">Semester {rollNoData.semester}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">EMAIL / CONTACT</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{rollNoData.student?.email}</span>
                  </div>
                </div>
                {/* Photo box placeholder */}
                <div className="h-28 w-24 border border-dashed border-slate-300 bg-white rounded-lg flex flex-col items-center justify-center text-[10px] text-slate-400 font-bold uppercase p-2 shrink-0 self-center sm:self-auto">
                  <span>Student</span>
                  <span>Photo</span>
                  <span className="text-[8px] text-slate-300 font-medium mt-1">Placeholder</span>
                </div>
              </div>

              {/* Enrolled Courses */}
              <div>
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                  <span>Approved Exam Course Registrations</span>
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Course Code</th>
                        <th className="px-4 py-3">Course Name</th>
                        <th className="px-4 py-3">Assigned Teacher</th>
                        <th className="px-4 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {rollNoData.courses.map((course, idx) => (
                        <tr key={idx} className="text-slate-700">
                          <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-indigo-600">{course.code}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{course.name}</td>
                          <td className="px-4 py-3 font-medium">{course.teacher || 'TBA'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-600 uppercase border border-emerald-200">
                              Admitted
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl text-xs space-y-2">
                <h4 className="font-bold text-amber-800 uppercase">Examination Code of Conduct</h4>
                <ol className="list-decimal pl-4 text-slate-600 space-y-1">
                  {rollNoData.instructionNotes.map((note, index) => (
                    <li key={index} className="leading-relaxed">{note}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MySlips;
