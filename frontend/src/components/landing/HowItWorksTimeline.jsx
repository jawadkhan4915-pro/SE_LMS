import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  BookOpen, 
  Laptop, 
  Award,
  ArrowRight,
  CheckCircle2,
  Crown
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Account Registration & Role Scope',
    description: 'Students, faculty, and administrative staff create verified portal accounts. HODs approve student course enrollments and assign role security scopes.',
    icon: UserPlus,
    badge: 'Phase 1: Onboarding',
    borderColor: '#f59e0b',
    iconStyle: 'border-amber-500/40 text-amber-300 bg-amber-500/10'
  },
  {
    number: '02',
    title: 'Smart Timetable & Course Access',
    description: 'Access conflict-free semester schedules, room allocations, syllabus blueprints, and digital learning resource repositories instantly.',
    icon: BookOpen,
    borderColor: '#0ea5e9',
    badge: 'Phase 2: Workspace',
    iconStyle: 'border-sky-500/40 text-sky-300 bg-sky-500/10'
  },
  {
    number: '03',
    title: 'Live Lectures, Quizzes & AI Assistance',
    description: 'Attend secure virtual lecture halls, take timed quizzes, submit coding assignments, and get immediate 24/7 help from the department AI assistant.',
    icon: Laptop,
    borderColor: '#6366f1',
    badge: 'Phase 3: Engagement',
    iconStyle: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10'
  },
  {
    number: '04',
    title: 'Attendance, Sessional & QR ID Verification',
    description: 'Track sessional performance in real-time, view verified monthly attendance percentages, and present cryptographically signed Virtual ID Cards.',
    icon: Award,
    borderColor: '#10b981',
    badge: 'Phase 4: Distinction',
    iconStyle: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
  }
];

export default function HowItWorksTimeline() {
  return (
    <section id="how-it-works" className="py-24 relative bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Department Workflow
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            How SE-LMS Delivers Academic Excellence
          </h2>
          
          <p className="text-base sm:text-lg text-slate-300">
            From first-day registration to final sessional marks — a seamless digital pipeline for software engineering academic operations.
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
                className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between relative group border border-slate-800 hover:border-amber-500/40 shadow-xl transition-all duration-300 border-t-4"
                style={{ borderTopColor: step.borderColor }}
              >
                <div>
                  {/* Top Step Number Badge + Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-700 font-mono group-hover:text-amber-300 transition-colors">
                      {step.number}
                    </span>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.iconStyle}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 block">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-extrabold text-white mb-2 leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Connector on Desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-700">
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
