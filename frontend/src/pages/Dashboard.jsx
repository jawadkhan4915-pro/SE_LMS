import React from 'react';
import { useSelector } from 'react-redux';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import HODDashboard from './HODDashboard';
import AccountantDashboard from './AccountantDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  switch (user?.role) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'hod':
      return <HODDashboard />;
    case 'accountant':
      return <AccountantDashboard />;
    default:
      return (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <p>Unknown User Role. Contact administration.</p>
        </div>
      );
  }
};

export default Dashboard;
