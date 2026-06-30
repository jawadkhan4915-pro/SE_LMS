import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  CreditCard, Search, CheckCircle, Clock, AlertCircle, RefreshCw, X, Filter
} from 'lucide-react';

const AccountantFees = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter]);

  const fetchVouchers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await api.get('/transactions/vouchers', { params });
      if (res.data.success) {
        setVouchers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load student fee vouchers.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Are you sure you want to mark this fee voucher as Paid? This will automatically post an income entry in the ledger.')) {
      return;
    }

    setProcessingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/transactions/fees/${id}/pay`);
      if (res.data.success) {
        setSuccessMsg('Fee voucher paid and ledger records logged.');
        fetchVouchers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Transaction submission failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    const studentName = v.student?.name || '';
    const studentEmail = v.student?.email || '';
    const voucherNo = v.voucherNo || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          voucherNo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Fee Management</h1>
          <p className="text-sm text-slate-400">Process student check-ins and verify tuition payments.</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters and Search Panel */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, email, or voucher number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 font-semibold cursor-pointer"
            >
              <option value="All">All Vouchers</option>
              <option value="Unpaid">Unpaid Only</option>
              <option value="Paid">Paid Only</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
              className="text-xs text-teal-650 hover:text-teal-850 font-semibold hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid records */}
      <div className="table-wrapper">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="section-title">Fee Slip Registry</h3>
          <span className="badge-blue bg-teal-50 text-teal-700">{filteredVouchers.length} slips listed</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="spinner h-8 w-8 text-teal-600" />
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">No fee vouchers found matching the criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="table-head">
                <tr>
                  {['Student Details', 'Semester / Section', 'Voucher #', 'Amount (PKR)', 'Due Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v) => {
                  const initial = v.student?.name?.charAt(0).toUpperCase() || 'S';
                  return (
                    <tr key={v._id} className="table-row-hover">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-650 text-xs">
                            {initial}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-snug">{v.student?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400">{v.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-xs">
                        <p className="font-semibold text-slate-700">Sem {v.semester}</p>
                        <p className="text-[10px] text-slate-400">Sec {v.student?.section || 'A'} · {v.student?.department}</p>
                      </td>
                      <td className="table-td text-xs font-mono font-bold text-slate-650">
                        {v.voucherNo}
                      </td>
                      <td className="table-td text-xs font-extrabold text-slate-850">
                        {v.amount.toLocaleString()}
                      </td>
                      <td className="table-td text-xs text-slate-600 font-medium">
                        {new Date(v.dueDate).toLocaleDateString()}
                      </td>
                      <td className="table-td">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                          v.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {v.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="table-td">
                        {v.status === 'Unpaid' ? (
                          <button
                            onClick={() => handleMarkPaid(v._id)}
                            disabled={processingId === v._id}
                            className="btn btn-sm bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all"
                          >
                            {processingId === v._id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              'Mark Paid'
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Paid on {v.paidAt ? new Date(v.paidAt).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantFees;
