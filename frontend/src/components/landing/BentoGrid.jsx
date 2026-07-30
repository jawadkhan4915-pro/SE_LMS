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
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const modules = [
  {
    id: 'courses',
    title: 'Course Management & Resources',
    description: 'Centralized repository for syllabus, lecture materials, PDFs, code repos, and semester module tracks.',
    icon: BookOpen,
    category: 'Core Academic',
    badgeColor: 'badge-blue',
    span: 'col-span-12 lg:col-span-8',
    gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    featured: true
  },
  {
    id: 'ai-assistant',
    title: 'AI Department Assistant',
    description: '24/7 AI chatbot trained on department curriculum to solve code problems & answer sessional queries.',
    icon: Bot,
    category: 'AI Powered',
    badgeColor: 'badge-sky',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    featured: true
  },
  {
    id: 'virtual-id',
    title: 'Digital Virtual ID & QR Verification',
    description: 'Cryptographically signed digital student & faculty cards with public QR verification endpoint.',
    icon: QrCode,
    category: 'Security',
    badgeColor: 'badge-green',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    featured: false
  },
  {
    id: 'live-lectures',
    title: 'Live Online Lecture Rooms',
    description: 'Distraction-free integrated virtual lecture halls with instant stream links and attendance sync.',
    icon: Video,
    category: 'Virtual Learning',
    badgeColor: 'badge-amber',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    featured: false
  },
  {
    id: 'attendance',
    title: 'Automated Attendance Tracking',
    description: 'Dual portal for course attendance and faculty self-attendance with monthly threshold reporting.',
    icon: CheckCircle2,
    category: 'Operations',
    badgeColor: 'badge-purple',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    featured: false
  },
  {
    id: 'assignments-quizzes',
    title: 'Assignments & Online Quizzes',
    description: 'Timed quiz portals, automated scoring, plagiarism checks, and direct file submissions.',
    icon: FileText,
    category: 'Assessments',
    badgeColor: 'badge-blue',
    span: 'col-span-12 sm:col-span-6 lg:col-span-6',
    gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    featured: false
  },
  {
    id: 'results-sessional',
    title: 'Results & Sessional Marks',
    description: 'Transparent grade breakdown, GPA calculators, and CSV export for department coordinators.',
    icon: BarChart3,
    category: 'Grading',
    badgeColor: 'badge-sky',
    span: 'col-span-12 sm:col-span-6 lg:col-span-6',
    gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    featured: false
  },
  {
    id: 'timetable',
    title: 'Smart Department Timetable',
    description: 'Conflict-free schedule matrices for rooms, lab slots, teacher hours, and student batches.',
    icon: Calendar,
    category: 'Scheduling',
    badgeColor: 'badge-amber',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    featured: false
  },
  {
    id: 'accounting',
    title: 'Fee Slips & Accounting Portal',
    description: 'Dedicated accountant role for managing fee receipts, staff salaries, and departmental ledgers.',
    icon: CreditCard,
    category: 'Finance',
    badgeColor: 'badge-green',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    featured: false
  },
  {
    id: 'notices',
    title: 'Notices & Department Bulletin',
    description: 'Real-time broadcast system with priority badges for exam schedules, events, and circulars.',
    icon: Bell,
    category: 'Broadcast',
    badgeColor: 'badge-purple',
    span: 'col-span-12 sm:col-span-6 lg:col-span-4',
    gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
    featured: false
  }
];

export default function BentoGrid() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Platform Capabilities
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Everything Software Engineering Education Needs
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            10 specialized modules built specifically for students, professors, department heads, coordinators, and administrative staff.
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
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`${item.span} group relative card card-hover p-6 sm:p-7 overflow-hidden flex flex-col justify-between`}
              >
                {/* Background Gradient Subtle Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={item.badgeColor}>
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    {item.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Micro-indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    Explore feature module →
                  </span>
                  <span className="text-[11px] font-mono opacity-60">0{index + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
