import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  BarChart3, Search, Calendar, Filter, ArrowUpRight, ArrowDownRight, Printer, RefreshCw
} from 'lucide-react';

const AccountantLedger = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netCashFlow: 0 });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchLedger();
  }, [typeFilter, categoryFilter, startDate, endDate]);

  const fetchLedger = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions/ledger', { params });
      if (res.data.success) {
        setLedger(res.data.data);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load ledger records.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setCategoryFilter('');
    setStartDate('');
    setEndDate('');
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredLedger = ledger.filter(t => {
    const titleMatch = t.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || descMatch;
  });

  return (
    <div className="space-y-6 print:p-0 print:bg-white print:text-black">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Financial General Ledger</h1>
          <p className="text-sm text-slate-400">Complete records of university income inflows and salary/operating outflows.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200"
          >
            <Printer className="h-4 w-4" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Printing Only Header */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-4">
        <h1 className="text-2xl font-extrabold">LMS ACCOUNTS OFFICE - GENERAL LEDGER REPORT</h1>
        <p className="text-sm text-slate-500 mt-1">Generated on: {new Date().toLocaleString()}</p>
      </div>

      {/* Summary KPI Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border border-teal-100 bg-teal-50/30">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Inflow</p>
          <p className="text-2xl font-extrabold text-teal-700 mt-1">PKR {summary.totalIncome.toLocaleString()}</p>
        </div>

        <div className="card p-4 border border-rose-100 bg-rose-50/30">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses Outflow</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">PKR {summary.totalExpense.toLocaleString()}</p>
        </div>

        <div className="card p-4 border border-indigo-105 bg-indigo-50/20">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Cash surplus</p>
          <p className={`text-2xl font-extrabold mt-1 ${summary.netCashFlow >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
            PKR {summary.netCashFlow.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters and search panel - Hidden in print */}
      <div className="card p-4 space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ledger descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filter */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-650 font-semibold cursor-pointer"
              >
                <option value="">All Transactions</option>
                <option value="income">Inflow (Income)</option>
                <option value="expense">Outflow (Expense)</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-650 font-semibold cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="fee">Fee Collections</option>
                <option value="salary">Staff Salaries</option>
                <option value="utility">Utility Invoices</option>
                <option value="maintenance">Maintenance Costs</option>
                <option value="event">Campus Events</option>
                <option value="other">Other Outlays</option>
              </select>
            </div>
          </div>
        </div>

        {/* Date Ranges */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50 text-slate-600 font-medium focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50 text-slate-600 font-medium focus:outline-none"
            />
          </div>

          {(searchTerm || typeFilter || categoryFilter || startDate || endDate) && (
            <button
              onClick={clearFilters}
              className="text-xs text-teal-600 hover:text-teal-800 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="table-wrapper print:border-slate-350">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between print:hidden">
          <h3 className="section-title">Transactions Entries</h3>
          <span className="badge-blue bg-teal-50 text-teal-700">{filteredLedger.length} items found</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex h-64 items-center justify-center print:hidden">
              <div className="spinner h-8 w-8 text-teal-600" />
            </div>
          ) : filteredLedger.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BarChart3 className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p className="text-sm">No transaction ledger history available.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="table-head">
                <tr className="print:bg-slate-100 print:text-black">
                  {['Date', 'Invoice Description', 'Category', 'Type', 'Amount (PKR)', 'Processed By'].map(h => (
                    <th key={h} className="table-th print:border-b print:border-slate-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((t) => (
                  <tr key={t._id} className="table-row-hover print:hover:bg-white print:border-b print:border-slate-100">
                    <td className="table-td font-medium text-slate-600">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="table-td">
                      <p className="font-bold text-slate-800 leading-snug">{t.title}</p>
                      {t.description && <p className="text-[10px] text-slate-400 mt-0.5">{t.description}</p>}
                    </td>
                    <td className="table-td">
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-650 uppercase">
                        {t.category}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                        t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`table-td font-extrabold text-sm ${
                      t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                    </td>
                    <td className="table-td text-slate-500 font-medium">
                      {t.processedBy?.name || 'Admin'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantLedger;
