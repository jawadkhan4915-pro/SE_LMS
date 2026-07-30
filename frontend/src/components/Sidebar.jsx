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
  Camera,
  Crown
} from 'lucide-react';

const roleColors = {
  student: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  teacher: { bg: 'bg-indigo-500/20', text: 'text-indigo-300' },
  admin: { bg: 'bg-rose-500/20', text: 'text-rose-300' },
  hod: { bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
  coordinator: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  accountant: { bg: 'bg-sky-500/20', text: 'text-sky-300' },
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
          { path: '/timetable', label: 'Timetable', icon: Calendar },
          { path: '/assignments', label: 'Assignments', icon: FileText },
          { path: '/quizzes', label: 'Online Quizzes', icon: CheckSquare },
          { path: '/lectures', label: 'Live Lectures', icon: Video },
          { path: '/sessional', label: 'Sessional Marks', icon: BarChart3 },
          { path: '/results', label: 'Exam Results', icon: Award },
          { path: '/slips', label: 'Fee Slips', icon: CreditCard },
          { path: '/virtual-card', label: 'Virtual Card', icon: GraduationCap },
        ];
      case 'teacher':
        return [
          ...common,
          { path: '/courses', label: 'My Courses', icon: BookOpen },
          { path: '/attendance/mark', label: 'Mark Attendance', icon: CalendarCheck },
          { path: '/timetable', label: 'Timetable', icon: Calendar },
          { path: '/teacher/self-attendance', label: 'Self Attendance', icon: Camera },
          { path: '/assignments/manage', label: 'Manage Assignments', icon: FileText },
          { path: '/quizzes/manage', label: 'Manage Quizzes', icon: CheckSquare },
          { path: '/lectures', label: 'Live Lectures', icon: Video },
          { path: '/sessional/manage', label: 'Sessional Marks', icon: BarChart3 },
          { path: '/results/upload', label: 'Upload Results', icon: Award },
          { path: '/virtual-card', label: 'Virtual Card', icon: GraduationCap },
        ];
      case 'hod':
        return [
          ...common,
          { path: '/hod/analytics', label: 'HOD Dashboard', icon: BarChart3 },
          { path: '/hod/enrollments', label: 'Enrollment Approvals', icon: CheckSquare },
          { path: '/hod/teacher-attendance', label: 'Teacher Attendance', icon: Camera },
          { path: '/courses', label: 'Dept Courses', icon: BookOpen },
          { path: '/timetable', label: 'Master Timetable', icon: Calendar },
        ];
      case 'coordinator':
        return [
          ...common,
          { path: '/coordinator/exams', label: 'Exam Dashboard', icon: BarChart3 },
          { path: '/courses', label: 'All Courses', icon: BookOpen },
          { path: '/timetable', label: 'Master Timetable', icon: Calendar },
        ];
      case 'accountant':
        return [
          ...common,
          { path: '/accountant/fees', label: 'Student Fees', icon: CreditCard },
          { path: '/accountant/salaries', label: 'Staff Salaries', icon: CreditCard },
          { path: '/accountant/expenses', label: 'Expenses', icon: CreditCard },
          { path: '/accountant/ledger', label: 'Monthly Ledger', icon: BarChart3 },
        ];
      case 'admin':
        return [
          ...common,
          { path: '/admin/users', label: 'Manage Users', icon: Users },
          { path: '/admin/courses', label: 'Manage Courses', icon: BookOpen },
          { path: '/admin/departments', label: 'Departments', icon: Building2 },
          { path: '/admin/teacher-attendance', label: 'Teacher Attendance', icon: Camera },
          { path: '/timetable', label: 'Timetable', icon: Calendar },
          { path: '/accountant/fees', label: 'Fees Portal', icon: CreditCard },
          { path: '/accountant/salaries', label: 'Salaries Portal', icon: CreditCard },
          { path: '/accountant/expenses', label: 'Expenses Portal', icon: CreditCard },
          { path: '/accountant/ledger', label: 'Financial Ledger', icon: BarChart3 },
        ];
      default:
        return common;
    }
  };

  const menuItems = getLinksByRole();
  const rc = roleColors[user?.role] || roleColors.student;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-slate-950 text-white flex flex-col transition-transform duration-300 border-r border-amber-500/20 shadow-2xl ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-amber-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 shadow-md">
          <GraduationCap className="h-6 w-6 text-slate-950" />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-white text-base leading-tight">
              {(user?.role === 'admin' || user?.role === 'accountant' || (user?.role === 'coordinator' && !user?.department)) ? 'Uni-LMS' : `${user?.department || 'SE'}-LMS`}
            </h1>
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-amber-300 text-[10px] font-semibold truncate">
            {user?.role === 'admin' ? 'University Admin' : (user?.role === 'accountant' ? 'University Accounts Dept' : (user?.role === 'coordinator' && !user?.department ? 'University Exam Dept' : `${getDepartmentFullName(user?.department)} Dept`))}
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="mx-4 mt-4 mb-2 p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${rc.bg} ${rc.text} font-black text-xs flex-shrink-0 border border-amber-500/30`}>
          {initials}
        </div>
        <div className="overflow-hidden min-w-0">
          <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${rc.text}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <p className="text-amber-400 text-[9px] font-extrabold uppercase tracking-widest px-2 py-2 mt-1">
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
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 font-extrabold border-l-2 border-amber-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
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
      <div className="px-3 pb-5 pt-2 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
