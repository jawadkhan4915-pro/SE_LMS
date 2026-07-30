import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Video, 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  Calendar, 
  Bot, 
  QrCode, 
  CreditCard, 
  Bell,
  Crown,
  ArrowUpRight
} from 'lucide-react';

const modules = [
  {
    id: 'courses',
    title: 'Course Management & Resources',
    description: 'Centralized repository for syllabus, lecture materials, PDFs, code repos, and semester module tracks.',
    icon: BookOpen,
    category: 'Core Academic',
    badgeStyle: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    span: 'col-span-12 lg:col-span-8',
    glow: 'from-indigo-500/15 via-indigo-500/5 to-transparent'
  },
  {
    id: 'ai-assistant',
    title: 'AI Department Assistant',
    description: '24/7 AI chatbot trained on department curriculum to solve code problems & answer sessional queries.',
    icon: Bot,
    category: 'AI Powered',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-amber-500/15 via-amber-500/5 to-transparent'
  },
  {
    id: 'virtual-id',
    title: 'Digital Virtual ID & QR Verification',
    description: 'Cryptographically signed digital student & faculty cards with public QR verification endpoint.',
    icon: QrCode,
    category: 'Security',
    badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent'
  },
  {
    id: 'live-lectures',
    title: 'Live Online Lecture Rooms',
    description: 'Distraction-free integrated virtual lecture halls with instant stream links and attendance sync.',
    icon: Video,
    category: 'Virtual Learning',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-amber-500/15 via-amber-500/5 to-transparent'
  },
  {
    id: 'attendance',
    title: 'Automated Attendance Tracking',
    description: 'Dual portal for course attendance and faculty self-attendance with monthly threshold reporting.',
    icon: CheckCircle2,
    category: 'Operations',
    badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-purple-500/15 via-purple-500/5 to-transparent'
  },
  {
    id: 'assignments-quizzes',
    title: 'Assignments & Online Quizzes',
    description: 'Timed quiz portals, automated scoring, plagiarism checks, and direct file submissions.',
    icon: FileText,
    category: 'Assessments',
    badgeStyle: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-6',
    glow: 'from-indigo-500/15 via-indigo-500/5 to-transparent'
  },
  {
    id: 'results-sessional',
    title: 'Results & Sessional Marks',
    description: 'Transparent grade breakdown, GPA calculators, and CSV export for department coordinators.',
    icon: BarChart3,
    category: 'Grading',
    badgeStyle: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-6',
    glow: 'from-sky-500/15 via-sky-500/5 to-transparent'
  },
  {
    id: 'timetable',
    title: 'Smart Department Timetable',
    description: 'Conflict-free schedule matrices for rooms, lab slots, teacher hours, and student batches.',
    icon: Calendar,
    category: 'Scheduling',
    badgeStyle: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-amber-500/15 via-amber-500/5 to-transparent'
  },
  {
    id: 'accounting',
    title: 'Fee Slips & Accounting Portal',
    description: 'Dedicated accountant role for managing fee receipts, staff salaries, and departmental ledgers.',
    icon: CreditCard,
    category: 'Finance',
    badgeStyle: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-emerald-500/15 via-emerald-500/5 to-transparent'
  },
  {
    id: 'notices',
    title: 'Notices & Department Bulletin',
    description: 'Real-time broadcast system with priority badges for exam schedules, events, and circulars.',
    icon: Bell,
    category: 'Broadcast',
    badgeStyle: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    glow: 'from-purple-500/15 via-purple-500/5 to-transparent'
  }
];

export default function BentoGrid() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-slate-950/70 backdrop-blur-md">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" /> Platform Capabilities
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Everything Software Engineering Education Demands
          </h2>
          
          <p className="text-base sm:text-lg text-slate-300">
            10 specialized modules engineered with Oxford academic distinction for students, faculty, and administrators.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-5 sm:gap-6">
          {modules.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                className={`${item.span} group relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 hover:border-amber-500/40 p-6 sm:p-7 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/5`}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:border-amber-400/50 transition-all duration-200 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${item.badgeStyle}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-extrabold text-white mb-2 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    {item.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </h3>
                  
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Micro-indicator */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200">
                    Explore feature module →
                  </span>
                  <span className="font-mono text-[11px] opacity-60">0{index + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
