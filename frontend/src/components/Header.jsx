import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/notices': 'Notice Board',
  '/resources': 'Resource Library',
  '/courses': 'My Courses',
  '/attendance': 'Attendance',
  '/assignments': 'Assignments',
  '/quizzes': 'Quizzes',
  '/attendance/mark': 'Mark Attendance',
  '/assignments/manage': 'Manage Assignments',
  '/quizzes/manage': 'Manage Quizzes',
  '/admin/users': 'Manage Users',
  '/admin/courses': 'Manage Courses',
  '/hod/analytics': 'Department Analytics',
};

const roleStyles = {
  student: 'bg-indigo-100 text-indigo-700',
  teacher: 'bg-sky-100 text-sky-700',
  admin: 'bg-amber-100 text-amber-700',
  hod: 'bg-emerald-100 text-emerald-700',
};

const Header = ({ toggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'SE-LMS';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const badgeStyle = roleStyles[user?.role] || 'bg-slate-100 text-slate-600';

  return (
    <header className="h-14 flex items-center justify-between gap-4 px-5 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Left: Toggle + Title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex-shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 truncate">{currentTitle}</h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Center: Search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xs">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="relative h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="hidden md:block text-right">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight truncate">{user?.email}</p>
          </div>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${badgeStyle}`}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
