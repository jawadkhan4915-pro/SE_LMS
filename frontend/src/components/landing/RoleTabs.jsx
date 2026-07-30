import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  GraduationCap, 
  BookOpenCheck, 
  ShieldCheck, 
  Briefcase, 
  Building2, 
  CheckCircle,
  Crown,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const rolesData = [
  {
    id: 'student',
    name: 'Student Portal',
    badge: 'Primary Learner',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    icon: GraduationCap,
    description: 'Empowering software engineering students with personalized academic management, sessional tracking, and live classroom tools.',
    features: [
      'View registered semester courses, syllabus & resources',
      'Track individual course attendance & sessional marks',
      'Submit assignments & attempt online timed quizzes',
      'Generate & verify public QR Digital Virtual ID Card',
      'Access 24/7 AI learning assistant for coding assistance',
      'View individual fee slips & payment status'
    ],
    stats: [
      { label: 'GPA Visibility', value: 'Instant' },
      { label: 'Submission Tracking', value: 'Automated' }
    ]
  },
  {
    id: 'teacher',
    name: 'Teacher / Faculty',
    badge: 'Course Instructor',
    badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    icon: BookOpenCheck,
    description: 'Streamlined tools for faculty members to manage class rosters, conduct live lectures, upload sessional marks, and track attendance.',
    features: [
      'Mark student attendance for assigned course sections',
      'Record daily faculty self-attendance with geolocation/time',
      'Upload & manage assignments, quizzes, and sessional marks',
      'Host instant live online lectures with zero setup',
      'Upload course lecture notes, repos, and video resources',
      'Monitor individual student academic progress'
    ],
    stats: [
      { label: 'Attendance Marking', value: '< 2 Mins' },
      { label: 'Live Stream Setup', value: '1-Click' }
    ]
  },
  {
    id: 'hod',
    name: 'Head of Department (HOD)',
    badge: 'Department Executive',
    badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    icon: Building2,
    description: 'High-level department analytics, course enrollment approvals, faculty attendance oversight, and academic reporting.',
    features: [
      'Review & approve student course enrollment requests',
      'Monitor department-wide teacher attendance & punctuality',
      'Access sessional distribution analytics across batches',
      'Approve course allocations and faculty assignments',
      'Manage departmental notices and circular broadcasts',
      'Generate department performance reports'
    ],
    stats: [
      { label: 'Enrollment Review', value: 'Centralized' },
      { label: 'Faculty Oversight', value: 'Real-time' }
    ]
  },
  {
    id: 'coordinator',
    name: 'Exam / Batch Coordinator',
    badge: 'Academic Operations',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    icon: Briefcase,
    description: 'Dedicated portal for organizing exam schedules, sessional verification, and batch timetables.',
    features: [
      'Design & publish master department timetable',
      'Coordinate mid-term and final exam sessional logs',
      'Verify teacher grade uploads before final publishing',
      'Manage batch rosters and section distributions',
      'Resolve scheduling conflicts automatically'
    ],
    stats: [
      { label: 'Exam Timetable', value: 'Conflict-Free' },
      { label: 'Grade Audit', value: 'Strict' }
    ]
  },
  {
    id: 'admin',
    name: 'System Administrator',
    badge: 'Superuser Access',
    badgeStyle: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    icon: ShieldCheck,
    description: 'Full administrative control over user accounts, department structures, security logs, and role permissions.',
    features: [
      'Manage all user accounts (Create, Edit, Deactivate)',
      'Assign roles & permission levels dynamically',
      'Configure departments, semesters, and system settings',
      'Monitor teacher attendance across all departments',
      'Audit system logs and security verification requests'
    ],
    stats: [
      { label: 'Access Control', value: 'RBAC 100%' },
      { label: 'Audit Logging', value: 'Complete' }
    ]
  },
  {
    id: 'accountant',
    name: 'Department Accountant',
    badge: 'Financial Operations',
    badgeStyle: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    icon: UserCheck,
    description: 'Comprehensive financial dashboard for fee collection, student fee slips, staff salaries, and expense ledgers.',
    features: [
      'Issue and manage student fee slips & payment status',
      'Process faculty & administrative staff monthly salaries',
      'Track departmental operational expenses and logs',
      'Generate monthly financial ledgers & balance sheets',
      'Verify receipt updates and payment clearances'
    ],
    stats: [
      { label: 'Financial Audit', value: 'Automated' },
      { label: 'Ledger Reporting', value: 'Real-Time' }
    ]
  }
];

export default function RoleTabs() {
  const [activeTab, setActiveTab] = useState(rolesData[0].id);
  const currentRole = rolesData.find((r) => r.id === activeTab) || rolesData[0];
  const navigate = useNavigate();

  return (
    <section id="roles" className="py-24 relative bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" /> Role-Based Access Scopes
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Tailored Experiences for Every Stakeholder
          </h2>
          
          <p className="text-base sm:text-lg text-slate-300">
            Select a portal role below to preview the exact tools, security scopes, and workflows designed for each department stakeholder.
          </p>
        </div>

        {/* Role Selector Navigation Bar */}
        <div className="flex items-center sm:justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-4xl mx-auto mb-12 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-2 shadow-2xl">
          {rolesData.map((role) => {
            const Icon = role.icon;
            const isActive = activeTab === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveTab(role.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'text-amber-300 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeRoleTab"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-amber-500/20 rounded-xl border border-amber-500/40 shadow-md"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {role.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRole.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto border border-amber-500/20 shadow-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Role Details & Checklist */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-indigo-600 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
                    <currentRole.icon className="w-7 h-7 text-slate-950" />
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${currentRole.badgeStyle}`}>
                      {currentRole.badge}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1">
                      {currentRole.name}
                    </h3>
                  </div>
                </div>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {currentRole.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Key Features & Scope:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentRole.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-6 py-3 rounded-xl font-extrabold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <span>Access {currentRole.name.split(' ')[0]} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Mini Stats Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-5 border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Module Status
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ● Active Security Guard
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {currentRole.stats.map((s, idx) => (
                      <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                        <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                        <p className="text-lg font-black text-amber-300 mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed italic border-t border-slate-800 pt-4">
                    "Enforced with Oxford academic standards, JWT role claims, and MongoDB document isolation."
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
