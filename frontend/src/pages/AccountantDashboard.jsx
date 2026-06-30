import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  DollarSign, ArrowUpRight, ArrowDownRight, CreditCard,
  CheckSquare, FileText, BarChart3, ChevronRight, AlertCircle
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AccountantDashboard = () => {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netCashFlow: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/transactions/ledger');
        if (res.data.success) {
          setStats(res.data.summary);
          setRecentTransactions(res.data.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load accountant stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-teal-600">
        <div className="spinner h-8 w-8 text-teal-600" />
      </div>
    );
  }

  // Chart configuration
  const barData = {
    labels: ['Fee Inflow', 'Salaries Outflow', 'Operating Expenses'],
    datasets: [{
      label: 'Amount (PKR)',
      data: [
        stats.totalIncome, 
        recentTransactions.filter(t => t.category === 'salary').reduce((a, b) => a + b.amount, 0) || (stats.totalExpense * 0.7),
        recentTransactions.filter(t => t.type === 'expense' && t.category !== 'salary').reduce((a, b) => a + b.amount, 0) || (stats.totalExpense * 0.3)
      ],
      backgroundColor: ['#0d9488', '#f43f5e', '#f59e0b'],
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  const doughnutData = {
    labels: ['Total Revenue', 'Total Outflows'],
    datasets: [{
      data: [stats.totalIncome, stats.totalExpense],
      backgroundColor: ['#0d9488', '#ef4444'],
      borderColor: ['#0d9488', '#ef4444'],
      borderWidth: 1.5,
      hoverOffset: 6
    }]
  };

  const kpis = [
    { label: 'Net Cash Flow', value: stats.netCashFlow, sub: 'University surplus', icon: DollarSign, color: stats.netCashFlow >= 0 ? 'text-teal-600' : 'text-red-500', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: 'Total Revenue', value: stats.totalIncome, sub: 'Fees collected', icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Total Outflows', value: stats.totalExpense, sub: 'Salaries & Bills', icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
  ];

  return (
    <div className="space-y-6">
      {/* Accountant Portal Welcome Header */}
      <div className="card p-5 bg-gradient-to-br from-teal-600 to-teal-800 border-0 text-white flex justify-between items-center">
        <div>
          <p className="text-teal-100 text-xs font-semibold uppercase tracking-wider">LMS Accounts Office</p>
          <h1 className="text-2xl font-bold mt-1">Welcome back, University Accountant 👋</h1>
          <p className="text-teal-100 text-sm mt-1">
            Overall University cash surplus stands at <span className="font-extrabold text-white">PKR {stats.netCashFlow.toLocaleString()}</span> today.
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`stat-card border ${k.border}`}>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{k.label}</p>
              <p className={`text-3xl font-extrabold mt-1 leading-none ${k.color}`}>
                PKR {k.value.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">{k.sub}</p>
            </div>
            <div className={`icon-box ${k.bg} ${k.color}`}>
              <k.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/accountant/fees" className="card p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all bg-white border border-teal-100/50">
          <div className="flex items-center gap-3">
            <div className="icon-box bg-teal-50 text-teal-600 rounded-lg">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Student Fees Office</p>
              <p className="text-xs text-slate-400">Process fees check-ins</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link to="/accountant/salaries" className="card p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all bg-white border border-teal-100/50">
          <div className="flex items-center gap-3">
            <div className="icon-box bg-rose-50 text-rose-600 rounded-lg">
              <CheckSquare className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Faculty Salaries</p>
              <p className="text-xs text-slate-400">Issue faculty payouts</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link to="/accountant/expenses" className="card p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all bg-white border border-teal-100/50">
          <div className="flex items-center gap-3">
            <div className="icon-box bg-amber-50 text-amber-600 rounded-lg">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Record Expense</p>
              <p className="text-xs text-slate-400">Add operating invoices</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>
      </div>

      {/* Main charts and ledger grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Ledger logs */}
        <div className="card p-5 lg:col-span-2">
          <div className="section-header pb-3 border-b border-slate-100">
            <div>
              <h3 className="section-title">Recent Transactions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Most recent ledger changes</p>
            </div>
            <Link to="/accountant/ledger" className="text-xs text-teal-600 font-semibold hover:underline flex items-center gap-0.5">
              Full Ledger <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-2 mt-4">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No transactions recorded.</p>
            ) : recentTransactions.map(t => (
              <div key={t._id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                    t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{t.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {new Date(t.date).toLocaleDateString()} · {t.category}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-extrabold ${
                  t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial distribution Doughnut */}
        <div className="card p-5 flex flex-col justify-between">
          <div className="section-header">
            <h3 className="section-title">Cash Ratio</h3>
            <BarChart3 className="h-4 w-4 text-teal-600" />
          </div>
          <div className="flex-1 flex items-center justify-center py-4" style={{ minHeight: 200 }}>
            {stats.totalIncome === 0 && stats.totalExpense === 0 ? (
              <div className="text-center text-xs text-slate-400">
                <AlertCircle className="h-8 w-8 mx-auto opacity-40 mb-1" />
                <span>No distribution data</span>
              </div>
            ) : (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  cutout: '75%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#64748b', font: { size: 10 }, boxWidth: 10 }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
