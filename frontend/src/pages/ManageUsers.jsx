import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  Users, Plus, Trash2, Search, ChevronLeft, ChevronRight, CheckCircle, X, UserPlus
} from 'lucide-react';

const roleBadge = {
  student: 'badge-blue',
  teacher: 'badge-sky',
  hod: 'badge-green',
  admin: 'badge-amber',
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [phone, setPhone] = useState('');

  const showMsg = (text) => { setMessage(text); setTimeout(() => setMessage(''), 3000); };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/users?page=${page}&search=${search}&role=${roleFilter}`);
      setUsers(r.data.data);
      setPagination(r.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    try {
      await api.post('/users', {
        name, email, password, role, phone,
        semester: role === 'student' ? Number(semester) : undefined,
        section: role === 'student' ? section : undefined
      });
      showMsg('User registered successfully!');
      setName(''); setEmail(''); setPassword(''); setPhone(''); setSection('A'); setIsOpen(false);
      fetchUsers();
    } catch (e) { alert(e.response?.data?.message || 'Failed to create user'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? All associated data will be removed.')) return;
    try {
      await api.delete(`/users/${id}`);
      showMsg('User deleted.');
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  if (loading && page === 1 && !search) return (
    <div className="flex h-64 items-center justify-center"><div className="spinner" /></div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">{pagination?.total || 0} registered accounts</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="btn-primary">
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      {message && (
        <div className="alert-success">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            className="form-input pl-9 py-2 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Role:</span>
          <select
            className="form-select py-2 text-sm"
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="hod">HODs</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                {['#', 'Name', 'Email', 'Role', 'Details', 'Actions'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-td text-center text-slate-400 py-10">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    No users found.
                  </td>
                </tr>
              ) : users.map((u, i) => (
                <tr key={u._id} className="table-row-hover">
                  <td className="table-td text-slate-400 text-xs">{(page - 1) * 10 + i + 1}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${roleBadge[u.role] || 'badge-gray'}`}>
                        {u.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-slate-500">{u.email}</td>
                  <td className="table-td">
                    <span className={roleBadge[u.role] || 'badge-gray'}>{u.role}</span>
                  </td>
                  <td className="table-td text-slate-550 text-xs">
                    {u.role === 'student' ? `Semester ${u.semester} (Sec ${u.section || 'A'})` : u.phone || '—'}
                  </td>
                  <td className="table-td">
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.pages} · {pagination.total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary btn-icon btn-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary btn-icon btn-sm disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <form className="modal-box" onSubmit={handleCreate} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register New User</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create student, teacher, or admin account</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary btn-icon">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Full Name *</label>
                  <input type="text" placeholder="John Doe" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input type="email" placeholder="name@university.edu" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Password *</label>
                  <input type="password" placeholder="Min 6 characters" className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input type="text" placeholder="+92 300 0000000" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {role === 'student' && (
                  <>
                    <div>
                      <label className="form-label">Semester</label>
                      <select className="form-select" value={semester} onChange={e => setSemester(e.target.value)}>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Section</label>
                      <select className="form-select" value={section} onChange={e => setSection(e.target.value)}>
                        {['A', 'B', 'C'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">
                <UserPlus className="h-4 w-4" /> Register User
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
