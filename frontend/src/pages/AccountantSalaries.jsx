import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  CheckSquare, Search, CheckCircle, AlertCircle, RefreshCw, X, Filter, DollarSign
} from 'lucide-react';

const AccountantSalaries = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  
  // Modal State
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('June');
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, [deptFilter]);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const params = {};
      if (deptFilter && deptFilter !== 'All') params.department = deptFilter;

      const res = await api.get('/transactions/faculty', { params });
      if (res.data.success) {
        setFaculty(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load faculty directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staff) => {
    setSelectedStaff(staff);
    // Set typical initial default salary estimate based on role
    if (staff.role === 'teacher') setAmount('120000');
    else if (staff.role === 'hod') setAmount('180000');
    else setAmount('90000');
    
    setMonth(new Date().toLocaleString('default', { month: 'long' }));
    setYear(new Date().getFullYear().toString());
    setDescription(`Monthly salary payout for ${staff.name}`);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCloseModal = () => {
    setSelectedStaff(null);
  };

  const handlePaySalary = async (e) => {
    e.preventDefault();
    if (!amount || !month || !year) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/transactions/pay-salary', {
        staffId: selectedStaff._id,
        amount: Number(amount),
        month,
        year,
        description
      });

      if (res.data.success) {
        setSuccessMsg(`Salary payout recorded for ${selectedStaff.name}.`);
        handleCloseModal();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Operation failed. Verify entries.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const name = f.name || '';
    const email = f.email || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2026', '2027', '2028'];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Salary Payouts</h1>
          <p className="text-sm text-slate-400">Distribute monthly wages and track faculty outflows.</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
          <CheckSquare className="h-5 w-5" />
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && !selectedStaff && (
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
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 font-semibold cursor-pointer"
            >
              {['All', 'SE', 'CS', 'IT', 'EE'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Records */}
      <div className="table-wrapper">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="section-title">Faculty & Staff Directory</h3>
          <span className="badge-blue bg-teal-50 text-teal-700">{filteredFaculty.length} employees listed</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="spinner h-8 w-8 text-teal-600" />
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Search className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">No employees match filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="table-head">
                <tr>
                  {['Staff details', 'Department', 'Role', 'Phone #', 'Action'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((f) => {
                  const initial = f.name?.charAt(0).toUpperCase() || 'S';
                  return (
                    <tr key={f._id} className="table-row-hover">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-650 text-xs">
                            {initial}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-snug">{f.name}</p>
                            <p className="text-[10px] text-slate-400">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td text-xs font-semibold text-slate-600">
                        {f.department || 'Central'}
                      </td>
                      <td className="table-td text-xs">
                        <span className="badge-blue uppercase text-[9px] font-bold">
                          {f.role}
                        </span>
                      </td>
                      <td className="table-td text-xs text-slate-600 font-medium">
                        {f.phone || 'N/A'}
                      </td>
                      <td className="table-td">
                        <button
                          onClick={() => handleOpenModal(f)}
                          className="btn btn-sm bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all"
                        >
                          Pay Salary
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Salary Payment Modal Backdrop */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-teal-600" />
                <span>Process Salary wage payout</span>
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handlePaySalary} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-bold text-slate-700">{selectedStaff.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedStaff.email} · {selectedStaff.role?.toUpperCase()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Salary wage amount (PKR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 120000"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Month *</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                  >
                    {months.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Year *</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Memo Description</label>
                <textarea
                  placeholder="Description..."
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  disabled={processing}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold rounded-xl flex-1 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex-1 transition-all flex items-center justify-center"
                >
                  {processing ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : 'Confirm Salary Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantSalaries;
