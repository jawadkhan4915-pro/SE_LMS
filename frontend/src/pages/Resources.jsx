import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FolderOpen, Plus, Trash2, CheckCircle, FileText, Globe, Youtube, Github, ExternalLink, X, Filter } from 'lucide-react';

const getIcon = (type) => {
  switch (type) {
    case 'youtube_link': return <Youtube className="h-5 w-5 text-red-500" />;
    case 'github_repo': return <Github className="h-5 w-5 text-slate-700" />;
    case 'pdf': case 'research_paper': case 'lecture_notes': return <FileText className="h-5 w-5 text-indigo-500" />;
    default: return <Globe className="h-5 w-5 text-sky-500" />;
  }
};

const getTypeBg = (type) => {
  switch (type) {
    case 'youtube_link': return 'bg-red-50';
    case 'github_repo': return 'bg-slate-100';
    case 'pdf': case 'research_paper': case 'lecture_notes': return 'bg-indigo-50';
    default: return 'bg-sky-50';
  }
};

const Resources = () => {
  const { user } = useSelector(s => s.auth);
  const [resources, setResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [url, setUrl] = useState('');
  const [formCourseId, setFormCourseId] = useState('');

  const showMsg = (text) => { setMessage(text); setTimeout(() => setMessage(''), 3000); };

  const fetchAll = async () => {
    try {
      const [rr, cr] = await Promise.all([
        api.get(`/resources${selectedCourseId ? `?courseId=${selectedCourseId}` : ''}`),
        api.get('/courses')
      ]);
      setResources(rr.data.data);
      setCourses(cr.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [selectedCourseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !url) return;
    try {
      await api.post('/resources', { title, type, url, courseId: formCourseId || undefined });
      showMsg('Resource added successfully!');
      setTitle(''); setUrl(''); setType('pdf'); setFormCourseId(''); setIsOpen(false);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
      showMsg('Resource removed.');
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="spinner" />
    </div>
  );

  const canManage = ['admin', 'teacher'].includes(user?.role);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Resource Library</h1>
          <p className="page-subtitle">{resources.length} materials available</p>
        </div>
        {canManage && (
          <button onClick={() => setIsOpen(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Resource
          </button>
        )}
      </div>

      {message && (
        <div className="alert-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter */}
      <div className="card p-4 flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter:</span>
        <select
          className="form-select flex-1 max-w-xs py-2 text-sm"
          value={selectedCourseId}
          onChange={e => setSelectedCourseId(e.target.value)}
        >
          <option value="">All Resources (Department-Wide)</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      {resources.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No resources found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <div key={r._id} className="card card-hover p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div className={`icon-box ${getTypeBg(r.type)} rounded-xl`}>
                  {getIcon(r.type)}
                </div>
                <span className="badge-gray text-[9px] capitalize">{r.type.replace('_', ' ')}</span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{r.title}</h3>
                <p className="text-xs text-slate-400">By {r.uploadedBy?.name || 'Faculty'}</p>
                {r.course && (
                  <p className="text-[10px] text-indigo-600 font-medium mt-1">{r.course?.code || 'Department'}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <a
                  href={r.url.startsWith('http') ? r.url : `https://${r.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open Resource
                </a>
                {canManage && (
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <form className="modal-box" onSubmit={handleCreate} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Resource</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload or link a new material</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary btn-icon">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input type="text" placeholder="Resource title" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                    <option value="pdf">PDF</option>
                    <option value="research_paper">Research Paper</option>
                    <option value="lecture_notes">Lecture Notes</option>
                    <option value="dataset">Dataset</option>
                    <option value="youtube_link">YouTube Video</option>
                    <option value="github_repo">GitHub Repo</option>
                    <option value="website">Website</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Course (Optional)</label>
                  <select className="form-select" value={formCourseId} onChange={e => setFormCourseId(e.target.value)}>
                    <option value="">General Dept.</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.code}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">URL / Link</label>
                <input type="text" placeholder="https://example.com/resource.pdf" className="form-input" value={url} onChange={e => setUrl(e.target.value)} required />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">
                <Plus className="h-4 w-4" /> Add Resource
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Resources;
