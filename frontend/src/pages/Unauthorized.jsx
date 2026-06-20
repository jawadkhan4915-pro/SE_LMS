import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

const Unauthorized = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="text-center max-w-sm">
      <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ShieldX className="h-9 w-9 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 text-sm mb-6">
        You don't have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <Link to="/dashboard" className="btn-primary inline-flex">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>
    </div>
  </div>
);

export default Unauthorized;
