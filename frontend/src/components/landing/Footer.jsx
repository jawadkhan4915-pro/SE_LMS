import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, QrCode, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                SE-LMS
              </span>
            </div>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Official Learning Management System for the Department of Software Engineering. Streamlining courses, sessional grades, live lectures, and virtual ID verification.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Status: All Services Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">Course Management</a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">Live Lectures</a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">Assignments & Quizzes</a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">Smart Timetable</a>
              </li>
              <li>
                <a href="#features" className="hover:text-indigo-400 transition-colors">AI Learning Assistant</a>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Portal Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">Student Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">Faculty Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">HOD Dashboard</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">Accountant Ledger</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-400 transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Verification & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Public Security
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/verify/card/sample" className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors text-slate-300">
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>Public QR Card Verify</span>
                </Link>
              </li>
              <li className="text-xs text-slate-500 pt-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1" />
                Protected by JWT authentication, role guards, and HTTPS payload encryption.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Software Engineering Department LMS (SE-LMS). All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for the SE Department.
          </p>
        </div>

      </div>
    </footer>
  );
}
