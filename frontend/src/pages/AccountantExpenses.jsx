import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  FileText, Plus, Search, CheckCircle, AlertCircle, RefreshCw, X, Filter, DollarSign, Calendar
} from 'lucide-react';

const AccountantExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('utility');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [processing, setProcessing] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { type: 'expense' };
      if (categoryFilter !== 'All') params.category = categoryFilter;

      const res = await api.get('/transactions/ledger', { params });
      if (res.data.success) {
        // Exclude salaries from this panel if we want to show generic expenses only,
        // or include them. Let's filter out 'salary' category to keep operating costs separated
        const list = res.data.data.filter(t => t.category !== 'salary');
        setExpenses(list);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load university operating expenses.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setTitle('');
    setCategory('utility');
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setErrorMsg('');
    setSuccessMsg('');
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !category || !amount) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/transactions/expense', {
        title,
        category,
        amount: Number(amount),
        description,
        date: date ? new Date(date) : new Date()
      });

      if (res.data.success) {
        setSuccessMsg('Expense logged successfully.');
        handleCloseModal();
        fetchExpenses();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Operation failed. Verify entry fields.');
    } finally {
      setProcessing(false);
    }
  };

  const filteredExpenses = expenses.filter(e => {
    const titleMatch = e.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = e.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || descMatch;
  });

  const categories = [
    { value: 'utility', label: 'Utility Bills' },
    { value: 'maintenance', label: 'Facility Maintenance' },
    { value: 'event', label: 'University Events' },
    { value: 'other', label: 'Other Operating Costs' }
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operating Expenses</h1>
          <p className="text-sm text-slate-400">Record bills, maintenance costs, and other administrative payments.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && !isOpen && (
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
            placeholder="Search expense titles or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-600 font-semibold cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="utility">Utility Bills</option>
              <option value="maintenance">Facility Maintenance</option>
              <option value="event">University Events</option>
              <option value="other">Other Costs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Records */}
      <div className="table-wrapper">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="section-title">Expense Log</h3>
          <span className="badge-blue bg-amber-50 text-amber-700">{filteredExpenses.length} entries listed</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="spinner h-8 w-8 text-teal-600" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">No expenses match filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="table-head">
                <tr>
                  {['Invoice Details', 'Category', 'Description', 'Amount (PKR)', 'Date', 'Logged By'].map(h => (
                    <th key={h} className="table-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="table-row-hover">
                    <td className="table-td font-semibold text-slate-800 text-xs">
                      {exp.title}
                    </td>
                    <td className="table-td text-xs">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="table-td text-xs text-slate-500 max-w-xs truncate" title={exp.description}>
                      {exp.description || 'N/A'}
                    </td>
                    <td className="table-td text-xs font-extrabold text-rose-600">
                      -{exp.amount.toLocaleString()}
                    </td>
                    <td className="table-td text-xs text-slate-600 font-medium">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="table-td text-xs text-slate-500 font-medium">
                      {exp.processedBy?.name || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Expense Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-teal-600" />
                <span>Record operating invoice expense</span>
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Invoice Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Electric Bill June 2026"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Amount (PKR) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Invoice Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-500 text-xs cursor-pointer"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Memo / Description</label>
                <textarea
                  placeholder="Details..."
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
                  {processing ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : 'Log Expense Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantExpenses;
