import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  BookOpen, 
  Laptop, 
  Award,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Account Registration & Role Assignment',
    description: 'Students, faculty, and administrative staff create verified portal accounts. HODs approve student course enrollments and assign role security scopes.',
    icon: UserPlus,
    badge: 'Step 1: Onboarding',
    color: 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
  },
  {
    number: '02',
    title: 'Smart Timetable & Course Access',
    description: 'Access conflict-free semester schedules, room allocations, syllabus blueprints, and digital learning resource repositories instantly from any device.',
    icon: BookOpen,
    badge: 'Step 2: Workspace',
    color: 'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
  },
  {
    number: '03',
    title: 'Live Lectures, Quizzes & AI Assistance',
    description: 'Attend secure virtual lecture halls, take timed quizzes, submit coding assignments, and get immediate 24/7 help from the department AI assistant.',
    icon: Laptop,
    badge: 'Step 3: Engagement',
    color: 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
  },
  {
    number: '04',
    title: 'Attendance, Sessional Marks & QR ID Verification',
    description: 'Track sessional performance in real-time, view verified monthly attendance percentages, and present cryptographically signed Virtual ID Cards.',
    icon: Award,
    badge: 'Step 4: Completion',
    color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
  }
];

export default function HowItWorksTimeline() {
  return (
    <section id="how-it-works" className="py-24 relative bg-slate-50/60 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" /> Department Workflow
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How SE-LMS Simplifies Campus Life
          </h2>
          
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            From first-day student registration to final sessional marks — a seamless digital pipeline for software engineering academic operations.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card card-hover p-6 flex flex-col justify-between relative group border-t-4"
                style={{ borderTopColor: index === 0 ? '#4f46e5' : index === 1 ? '#0ea5e9' : index === 2 ? '#f59e0b' : '#10b981' }}
              >
                <div>
                  {/* Top Step Number Badge + Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-300 dark:text-slate-700 font-mono group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {step.number}
                    </span>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 block">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Connector on Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-300 dark:text-slate-700">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
