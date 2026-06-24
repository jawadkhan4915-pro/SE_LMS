import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  FileText, Download, Printer, ShieldAlert, Lock, Unlock,
  CreditCard, GraduationCap, Building2, Calendar, ClipboardCheck,
  CheckCircle, AlertTriangle, Send, DollarSign, Clock
} from 'lucide-react';
import { getDepartmentFullName } from '../utils/departmentHelper';

const MySlips = () => {
  const [activeTab, setActiveTab] = useState('fee'); // 'fee' or 'rollnumber'
  const [feeData, setFeeData] = useState(null);
  const [rollNoData, setRollNoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVoucherIdx, setSelectedVoucherIdx] = useState(0);
  
  // Installment application state
  const [showApplyInstallments, setShowApplyInstallments] = useState(false);
  const [installmentReason, setInstallmentReason] = useState('');
  const [applyingInstallments, setApplyingInstallments] = useState(false);

  // Simulation states
  const [simulatedMidterm, setSimulatedMidterm] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [payingVoucherId, setPayingVoucherId] = useState(null);

  const fetchSlips = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch midterm settings first to keep simulator in sync
      const settingsRes = await api.get('/slips/midterm');
      setSimulatedMidterm(settingsRes.data.data.midtermExamDate);
      setIsLocked(settingsRes.data.data.isLocked);

      if (activeTab === 'fee') {
        const res = await api.get('/slips/fee');
        setFeeData(res.data.data);
      } else {
        const res = await api.get('/slips/rollnumber');
        setRollNoData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      if (activeTab === 'rollnumber' && err.response?.data?.locked) {
        setIsLocked(true);
        setError(err.response?.data?.message);
      } else {
        setError(err.response?.data?.message || 'Failed to load slip details. Please verify your enrollment is approved.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlips();
  }, [activeTab]);

  const handleMidtermChange = async (e) => {
    const newDate = e.target.value;
    setSimulatedMidterm(newDate);
    try {
      await api.post('/slips/midterm', { date: newDate });
      // Refresh current tab data
      fetchSlips();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayVoucher = async (voucherId) => {
    setPayingVoucherId(voucherId);
    try {
      await api.post('/slips/fee/pay', { voucherId });
      // Refresh slip details
      fetchSlips();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to pay voucher');
    } finally {
      setPayingVoucherId(null);
    }
  };

  const handleApplyInstallments = async (e) => {
    e.preventDefault();
    if (!installmentReason.trim()) return;

    setApplyingInstallments(true);
    try {
      await api.post('/slips/fee/installment', { reason: installmentReason });
      setShowApplyInstallments(false);
      setInstallmentReason('');
      setSelectedVoucherIdx(0);
      fetchSlips();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to apply for installments');
    } finally {
      setApplyingInstallments(false);
    }
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 7);
    return d.toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const selectedVoucher = feeData?.vouchers?.[selectedVoucherIdx];

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
          <h1 className="page-title font-bold text-2xl text-slate-800">Slips & Vouchers</h1>
          <p className="page-subtitle text-slate-500 text-sm">Download or print your official semester fee slip and roll number slips</p>
        </div>
        <button 
          onClick={handlePrint} 
          disabled={error && activeTab !== 'fee'} // Allow printing fee vouchers even if roll no slip is locked
          className="btn-primary flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transition-colors"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Demo Controls Banner (Simulation settings) */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 no-print border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <span className="text-lg">⚙️</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">University Exam Date Simulator</p>
            <p className="text-xs text-slate-400">Simulate date locking logic: Roll Number Slip locks automatically if unpaid 1 week before Midterm.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Midterm Date:</span>
            <input 
              type="date" 
              value={simulatedMidterm} 
              onChange={handleMidtermChange}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium flex items-center gap-1.5">
            <span className="text-slate-400">Lock Deadline:</span>
            <span className="text-amber-400 font-bold">{formatDeadline(simulatedMidterm)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span>Slip Panel Status:</span>
            {isLocked ? (
              <span className="text-rose-400 flex items-center gap-1 font-extrabold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                <Lock className="h-3 w-3" /> Locked
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Unlock className="h-3 w-3" /> Unlocked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 no-print">
        <button
          onClick={() => setActiveTab('fee')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === 'fee'
              ? 'border-indigo-600 text-indigo-600 font-bold'
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
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Roll Number Slip</span>
          </div>
        </button>
      </div>

      {/* Tab Content Preview */}
      {activeTab === 'fee' && feeData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left panel: Voucher Picker, Installments Form & Status (no-print) */}
          <div className="space-y-4 no-print lg:col-span-1">
            
            {/* Voucher list */}
            <div className="card p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Vouchers for Semester {feeData.semester}</h3>
              <div className="space-y-2">
                {feeData.vouchers.map((v, idx) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVoucherIdx(idx)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedVoucherIdx === idx
                        ? 'border-indigo-500 bg-indigo-50/40 text-indigo-900 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold font-mono truncate max-w-[150px]">{v.voucherNo}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        v.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {v.type === 'installment' ? `Installment #${v.installmentNo}` : 'Full Fee'}
                      </span>
                      <span className="font-extrabold text-slate-800">Rs. {v.amount.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Voucher Actions */}
            {selectedVoucher && (
              <div className="card p-4 bg-indigo-950 text-white border-0 rounded-2xl shadow-md space-y-4">
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Active Voucher Selected</p>
                  <h4 className="text-sm font-mono font-bold mt-1">{selectedVoucher.voucherNo}</h4>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-extrabold">Rs. {selectedVoucher.amount.toLocaleString()}</span>
                    <span className="text-xs text-indigo-300">PKR</span>
                  </div>
                </div>

                {selectedVoucher.status === 'Unpaid' ? (
                  <button
                    onClick={() => handlePayVoucher(selectedVoucher._id)}
                    disabled={payingVoucherId === selectedVoucher._id}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5"
                  >
                    {payingVoucherId === selectedVoucher._id ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    <span>Simulate Voucher Payment</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Paid on {new Date(selectedVoucher.paidAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Installment Application panel */}
            {!feeData.hasAppliedInstallments && feeData.vouchers.some(v => v.type === 'full' && v.status === 'Unpaid') && (
              <div className="card p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex gap-2.5 items-start">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 uppercase">Apply for Installment</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed mt-1">If you are unable to pay the full semester fee at once, apply for 3 installments. Note: You must pay at least one installment 1 week before the midterm to download your roll number slip.</p>
                  </div>
                </div>

                {!showApplyInstallments ? (
                  <button
                    onClick={() => setShowApplyInstallments(true)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Request Fee Installments
                  </button>
                ) : (
                  <form onSubmit={handleApplyInstallments} className="space-y-2 mt-2">
                    <textarea
                      placeholder="Specify your reason for installment application..."
                      value={installmentReason}
                      onChange={(e) => setInstallmentReason(e.target.value)}
                      required
                      rows="2"
                      className="w-full p-2 text-xs border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none text-slate-800"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowApplyInstallments(false)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={applyingInstallments || !installmentReason.trim()}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                      >
                        {applyingInstallments ? 'Submitting...' : 'Submit'}
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Voucher preview for printing */}
          <div className="lg:col-span-2 space-y-4">
            {selectedVoucher ? (
              <div className="card p-6 md:p-8 bg-white shadow-sm border border-slate-200 printable-slip max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-slate-900 text-md sm:text-lg">DEPARTMENT OF {getDepartmentFullName(feeData.student?.department || 'SE').toUpperCase()}</h2>
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                        {feeData.student?.department || 'SE'} LMS {selectedVoucher.type === 'installment' ? 'Installment' : 'Semester'} fee voucher
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedVoucher.status === 'Paid'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                        : 'bg-rose-50 border border-rose-200 text-rose-600'
                    }`}>
                      {selectedVoucher.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Voucher No: <span className="text-slate-800 font-bold font-mono">{selectedVoucher.voucherNo}</span></p>
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
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">Semester {feeData.semester} · BS {getDepartmentFullName(feeData.student?.department || 'SE')}</span>
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
                          <th className="px-4 py-3">Fee Description</th>
                          <th className="px-4 py-3 text-right">Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {selectedVoucher.feesBreakdown.map((item, idx) => (
                          <tr key={idx} className="text-slate-700">
                            <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium">{item.category}</td>
                            <td className="px-4 py-3 text-right font-semibold">Rs. {item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 text-sm">
                          <td colSpan="2" className="px-4 py-3.5 text-right">Total Payable Amount</td>
                          <td className="px-4 py-3.5 text-right text-indigo-700 font-extrabold">Rs. {selectedVoucher.amount.toLocaleString()}</td>
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
                    <p className="text-slate-600 font-medium">Due Date: <span className="text-red-600 font-bold">{selectedVoucher.dueDate}</span></p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      {selectedVoucher.type === 'installment' 
                        ? 'Please pay this installment timely to maintain your roll number slip access. A minimum of one installment is required 7 days prior to exams.' 
                        : 'Deposit the due fee at any online HBL branch and upload the stamped copy to avoid a late fee penalty of Rs. 1,000.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400">Select a voucher from the left list to view.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rollnumber' && (
        <div className="space-y-6">
          {isLocked ? (
            /* Render a premium Lock Screen */
            <div className="card p-10 bg-white border border-slate-200 rounded-2xl shadow-sm text-center max-w-xl mx-auto space-y-6 animate-fade-up">
              <div className="mx-auto h-20 w-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
                <Lock className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-800">Roll Number Slip Locked</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Your slip is locked because the lock deadline (<span className="text-rose-600 font-bold">{formatDeadline(simulatedMidterm)}</span>) has passed or is active, and no fee payments have been received for this semester.
                </p>
              </div>

              <div className="bg-rose-50/50 p-4 rounded-xl text-xs text-rose-700 border border-rose-100 leading-relaxed text-left flex gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Required Actions:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li>Pay your **full semester fee** via the "Semester Fee Slip" tab, OR</li>
                    <li>If applied for installments, pay at least **one installment voucher** to automatically unlock your roll number slip.</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('fee')}
                className="btn-primary px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow transition-colors text-sm"
              >
                Go to Fee Slip Panel
              </button>
            </div>
          ) : rollNoData ? (
            /* Render Unlocked Roll Number Slip */
            <div className="card p-6 md:p-8 bg-white shadow-sm border border-slate-200 printable-slip max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-md sm:text-lg">DEPARTMENT OF {getDepartmentFullName(rollNoData.student?.department || 'SE').toUpperCase()}</h2>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Midterm & Final Examination Roll Number Slip</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Session: <span className="text-slate-800 font-bold">{rollNoData.examSession}</span></p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Roll No: <span className="text-indigo-600 font-bold font-mono">{rollNoData.rollNumber}</span></p>
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
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{rollNoData.student?.program || `BS ${getDepartmentFullName(rollNoData.student?.department || 'SE')}`}</span>
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
          ) : (
            <div className="text-center p-12 text-slate-400">Failed to load slip data.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MySlips;
