import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { getDepartmentFullName } from '../utils/departmentHelper';
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  FileText,
  Award,
  Megaphone,
  FolderOpen,
  Users,
  BarChart3,
  LogOut,
  GraduationCap,
  ChevronRight,
  CreditCard,
  CheckSquare,
  Video,
  Calendar,
  Sparkles,
  Building2,
  Camera
} from 'lucide-react';

const roleColors = {
  student: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  teacher: { bg: 'bg-sky-100', text: 'text-sky-700' },
  admin: { bg: 'bg-amber-100', text: 'text-amber-700' },
  hod: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  coordinator: { bg: 'bg-purple-100', text: 'text-purple-700' },
  accountant: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const getLinksByRole = () => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
      { path: '/notices', label: 'Notice Board', icon: Megaphone },
      { path: '/resources', label: 'Resources', icon: FolderOpen },
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...common,
          { path: '/courses', label: 'My Courses', icon: BookOpen },
          { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
          { path: '/assignments', label: 'Assignments', icon: FileText },
          { path: '/quizzes', label: 'Quizzes', icon: Award },
          { path: '/sessional', label: 'Sessional Marks', icon: CheckSquare },
          { path: '/results', label: 'Transcript & Results', icon: GraduationCap },
          { path: '/slips', label: 'Slips & Vouchers', icon: CreditCard },
          { path: '/lectures', label: 'Online Lectures', icon: Video },
          { path: '/timetable', label: 'Class Timetable', icon: Calendar },
        ];
      case 'teacher':
        return [
          ...common,
          { path: '/courses', label: 'My Courses', icon: BookOpen },
          { path: '/attendance/mark', label: 'Mark Attendance', icon: CalendarCheck },
          { path: '/teacher/self-attendance', label: 'Self Attendance (Face)', icon: Camera },
          { path: '/assignments/manage', label: 'Assignments', icon: FileText },
          { path: '/quizzes/manage', label: 'Quizzes', icon: Award },
          { path: '/sessional/manage', label: 'Sessional Marks', icon: CheckSquare },
          { path: '/results/upload', label: 'Manage Exam Results', icon: GraduationCap },
          { path: '/lectures', label: 'Online Lectures', icon: Video },
          { path: '/timetable', label: 'Class Timetable', icon: Calendar },
        ];
      case 'hod':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
          { path: '/hod/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/hod/enrollments', label: 'Enrollment Approvals', icon: Users },
          { path: '/hod/teacher-attendance', label: 'Teacher Attendance', icon: CalendarCheck },
          { path: '/courses', label: 'View Courses', icon: BookOpen },
          { path: '/notices', label: 'Notice Board', icon: Megaphone },
          { path: '/resources', label: 'Resources', icon: FolderOpen },
        ];
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/users', label: 'Manage Users', icon: Users },
          { path: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
          { path: '/admin/departments', label: 'Manage Depts', icon: Building2 },
          { path: '/timetable', label: 'Manage Timetable', icon: Calendar },
          { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
          { path: '/hod/enrollments', label: 'Enrollment Approvals', icon: Users }, // Admins can also approve
          { path: '/admin/teacher-attendance', label: 'Teacher Attendance', icon: CalendarCheck },
          { path: '/notices', label: 'Notice Board', icon: Megaphone },
          { path: '/resources', label: 'Resources', icon: FolderOpen },
        ];
      case 'coordinator':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/coordinator/exams', label: 'Exam Operations', icon: FileText },
          { path: '/results/upload', label: 'Manage Exam Results', icon: GraduationCap },
          { path: '/sessional/manage', label: 'Sessional Marks', icon: CheckSquare },
          { path: '/ai-assistant', label: 'AI Assistant', icon: Sparkles },
          { path: '/notices', label: 'Notice Board', icon: Megaphone },
          { path: '/resources', label: 'Resources', icon: FolderOpen },
        ];
      case 'accountant':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/accountant/fees', label: 'Manage Student Fees', icon: CreditCard },
          { path: '/accountant/salaries', label: 'Pay Faculty Salaries', icon: CheckSquare },
          { path: '/accountant/expenses', label: 'Record Expenses', icon: FileText },
          { path: '/accountant/ledger', label: 'Financial Ledger', icon: BarChart3 }
        ];
      default:
        return common;
    }
  };

  const menuItems = getLinksByRole();
  const rc = roleColors[user?.role] || { bg: 'bg-slate-100', text: 'text-slate-600' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SE';

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0
        bg-gradient-to-b from-indigo-900 to-indigo-950
        flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-white text-base leading-tight">
            {(user?.role === 'admin' || user?.role === 'accountant' || (user?.role === 'coordinator' && !user?.department)) ? 'Uni-LMS' : `${user?.department || 'SE'}-LMS`}
          </h1>
          <p className="text-indigo-300 text-[10px] font-medium truncate">
            {user?.role === 'admin' ? 'University Admin' : (user?.role === 'accountant' ? 'University Accounts Dept' : (user?.role === 'coordinator' && !user?.department ? 'University Exam Dept' : `${getDepartmentFullName(user?.department)} Dept`))}
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 mt-4 mb-2 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${rc.bg} ${rc.text} font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="overflow-hidden min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${rc.text.replace('700', '300')}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest px-2 py-2 mt-1">
          Main Navigation
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-3 w-3 opacity-40" />
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
