import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Building2, Plus, Edit2, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Alert Messages
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data.data);
      // Sync localStorage cache for department helper mapping
      localStorage.setItem('departments', JSON.stringify(res.data.data));
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      setErrorMsg('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setCode('');
    setName('');
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditing(true);
    setEditId(dept._id);
    setCode(dept.code);
    setName(dept.name);
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    if (!code || !name) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/departments/${editId}`, { code, name });
        setMessage('Department details updated successfully.');
      } else {
        await api.post('/departments', { code, name });
        setMessage('New academic department registered.');
      }
      
      setCode('');
      setName('');
      setIsOpen(false);
      fetchDepartments();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Operation failed. Please try again.');
    }
  };

  const handleDelete = async (id, deptCode) => {
    if (!window.confirm(`Are you sure you want to delete the department ${deptCode}? This may affect users or courses currently assigned to this department.`)) {
      return;
    }

    try {
      setErrorMsg('');
      setMessage('');
      await api.delete(`/departments/${id}`);
      setMessage(`Department '${deptCode}' deleted successfully.`);
      fetchDepartments();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-amber-500">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-amber-500" />
          <span>University Departments</span>
        </h2>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Success Notification */}
      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      {/* Error Notification outside Modal */}
      {errorMsg && !isOpen && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registry Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/40 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="p-4 w-1/4">Code</th>
              <th className="p-4 w-1/2">Department Name</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {departments.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500">No departments configured in the LMS.</td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept._id} className="hover:bg-slate-900/10">
                  <td className="p-4 font-bold text-amber-500">
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">{dept.code}</span>
                  </td>
                  <td className="p-4 text-slate-200 font-semibold">{dept.name}</td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-500 transition-colors"
                      title="Edit Department"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(dept._id, dept.code)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-500 transition-colors"
                      title="Delete Department"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Creation/Edit Dialog Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Building2 className="h-4.5 w-4.5 text-amber-500" />
                <span>{isEditing ? 'Modify Department Details' : 'Register New Department'}</span>
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department Code *</label>
                <input
                  type="text"
                  placeholder="e.g. AI, CS, SE"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={10}
                  required
                />
                <span className="text-[9px] text-slate-500">Short abbreviation used internally (e.g. SE)</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence"
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <span className="text-[9px] text-slate-500">Full display name shown on panels, slips, and registrations</span>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex-1 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex-1 transition-all"
                >
                  {isEditing ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
