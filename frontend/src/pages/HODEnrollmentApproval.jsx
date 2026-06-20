import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, 
  BookOpen, User, Inbox, RefreshCw, X, MessageSquare 
} from 'lucide-react';

const HODEnrollmentApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  
  // Rejection Dialog state
  const [rejectionRequest, setRejectionRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch enrollment requests from backend
      const res = await api.get('/enrollment-requests');
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
      showMsg('Failed to load enrollment requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, studentName, courseName) => {
    if (!window.confirm(`Are you sure you want to approve enrollment for ${studentName} in ${courseName}?`)) return;

    try {
      const res = await api.put(`/enrollment-requests/${id}/approve`);
      showMsg(res.data.message || 'Enrollment request approved successfully!', 'success');
      fetchRequests();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to approve request', 'error');
    }
  };

  const handleRejectClick = (req) => {
    setRejectionRequest(req);
    setRejectionReason('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionRequest) return;

    try {
      const res = await api.put(`/enrollment-requests/${rejectionRequest._id}/reject`, {
        rejectionReason
      });
      showMsg(res.data.message || 'Enrollment request rejected.', 'success');
      setRejectionRequest(null);
      fetchRequests();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to reject request', 'error');
    }
  };

  // Filter requests based on tab
  const filteredRequests = requests.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (loading && requests.length === 0) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Enrollment Approvals</h1>
          <p className="page-subtitle">Review, approve, or reject student self-enrollment requests</p>
        </div>
        <button 
          onClick={fetchRequests}
          className="btn-secondary btn-icon flex items-center justify-center"
          title="Refresh List"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {/* Message Notifications */}
      {message.text && (
        <div className={message.type === 'error' ? 'alert-error' : 'alert-success'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Pending Requests</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{pendingCount}</span>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-250 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Approved Enrollments</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{approvedCount}</span>
          </div>
        </div>

        <div className="card p-5 bg-white border border-slate-200 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-250 flex items-center justify-center text-rose-600 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Rejected Requests</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-450 hover:text-slate-650'
            }`}
          >
            {tab} ({
              tab === 'all' ? requests.length :
              tab === 'pending' ? pendingCount :
              tab === 'approved' ? approvedCount :
              rejectedCount
            })
          </button>
        ))}
      </div>

      {/* Requests table / view */}
      {filteredRequests.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-slate-200">
          <Inbox className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold text-sm">No enrollment requests found</p>
          <p className="text-slate-400 text-xs mt-1">Requests matching the filter "{activeTab}" will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-250 font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Student Info</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Course Request</th>
                  <th className="px-5 py-3">Student Reason</th>
                  <th className="px-5 py-3">Date Submitted</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredRequests.map((req) => {
                  const initials = req.student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';
                  return (
                    <tr key={req._id} className="table-row-hover text-slate-700">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-650 font-bold flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">{req.student?.name || 'Unknown Student'}</span>
                            <span className="text-slate-400 block">{req.student?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-750">
                        Semester {req.student?.semester || req.course?.semester || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-800 block">{req.course?.name || 'Deleted Course'}</span>
                        <span className="text-indigo-600 block font-semibold">{req.course?.code} ({req.course?.creditHours} cr)</span>
                      </td>
                      <td className="px-5 py-3.5 italic max-w-xs truncate" title={req.reason}>
                        {req.reason ? `"${req.reason}"` : <span className="text-slate-350">No note provided</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {req.status}
                        </span>
                        {req.status === 'rejected' && req.rejectionReason && (
                          <p className="text-[10px] text-rose-500 font-semibold mt-1">Reason: {req.rejectionReason}</p>
                        )}
                        {req.status === 'approved' && req.approvedBy && (
                          <p className="text-[10px] text-slate-400 font-semibold mt-1">By: {req.approvedBy.name}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApprove(req._id, req.student?.name, req.course?.name)}
                              className="btn-success btn-sm flex items-center gap-1 text-[10px]"
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectClick(req)}
                              className="btn-danger btn-sm flex items-center gap-1 text-[10px]"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Justification Dialog */}
      {rejectionRequest && (
        <div className="modal-overlay" onClick={() => setRejectionRequest(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleRejectSubmit}>
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Reject Course Enrollment</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Rejecting request from: <strong className="text-slate-700 font-semibold">{rejectionRequest.student?.name}</strong> for {rejectionRequest.course?.name}
                    </p>
                  </div>
                  <button type="button" onClick={() => setRejectionRequest(null)} className="btn-secondary btn-icon">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="form-label block mb-1">Reason for Rejection</label>
                  <p className="text-[11px] text-slate-450 mb-2">Provide feedback or instructions on why this enrollment request is being denied.</p>
                  <textarea
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-red-500 h-24 resize-none"
                    placeholder="e.g. This course is not offered in your current semester, or class section is already at maximum capacity."
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setRejectionRequest(null)} 
                  className="btn-secondary w-full"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-danger w-full"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODEnrollmentApproval;
