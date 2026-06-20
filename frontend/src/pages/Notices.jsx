import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { Megaphone, Plus, Trash2, Calendar, CheckCircle, X, AlertCircle } from 'lucide-react';

const Notices = () => {
  const { user } = useSelector(s => s.auth);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRoles, setTargetRoles] = useState(['student']);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const fetchNotices = async () => {
    try {
      const r = await api.get('/notices');
      setNotices(r.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleRoleToggle = (role) =>
    setTargetRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !content || targetRoles.length === 0) {
      showMsg('Please fill all fields and select target roles', 'error');
      return;
    }
    try {
      await api.post('/notices', { title, content, targetRoles });
      showMsg('Notice published successfully!');
      setTitle(''); setContent(''); setTargetRoles(['student']); setIsOpen(false);
      fetchNotices();
    } catch (e) { showMsg('Failed to publish notice', 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
      showMsg('Notice removed.');
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const canPost = ['admin', 'hod', 'teacher'].includes(user?.role);

  const categoryBadge = (role) => {
    const m = { admin: 'badge-red', hod: 'badge-purple', teacher: 'badge-blue', student: 'badge-green' };
    return m[role] || 'badge-gray';
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-subtitle">{notices.length} announcements posted</p>
        </div>
        {canPost && (
          <button onClick={() => setIsOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Post Notice
          </button>
        )}
      </div>

      {/* Alert */}
      {message.text && (
        <div className={message.type === 'error' ? 'alert-error' : 'alert-success'}>
          {message.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle className="h-4 w-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Notices List */}
      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="card p-12 text-center">
            <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No notices have been posted yet.</p>
          </div>
        ) : notices.map(n => (
          <div key={n._id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`${categoryBadge(n.postedBy?.role)}`}>
                  {n.postedBy?.role || 'Admin'}
                </span>
                <span className="text-xs font-semibold text-slate-700">{n.postedBy?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(n.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">{n.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>

            {n.targetRoles && n.targetRoles.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">For:</span>
                {n.targetRoles.map(r => (
                  <span key={r} className="badge-gray text-[9px] capitalize">{r}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Post Notice Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <form className="modal-box" onSubmit={handleCreate} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Post New Notice</h3>
                <p className="text-xs text-slate-400 mt-0.5">Broadcast to selected roles</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary btn-icon">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Notice Title</label>
                <input
                  type="text"
                  placeholder="Enter notice title..."
                  className="form-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Content</label>
                <textarea
                  placeholder="Write the announcement details..."
                  className="form-textarea min-h-[120px]"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Target Roles</label>
                <div className="flex flex-wrap gap-3">
                  {['student', 'teacher', 'hod'].map(role => (
                    <label key={role} className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm font-medium transition-all ${targetRoles.includes(role) ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      <input
                        type="checkbox"
                        className="accent-indigo-600"
                        checked={targetRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                      />
                      <span className="capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                <Megaphone className="h-4 w-4" /> Publish Notice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Notices;
