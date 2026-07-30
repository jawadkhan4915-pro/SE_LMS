import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Layers, 
  Users, 
  ShieldCheck, 
  Bot, 
  Activity,
  Crown 
} from 'lucide-react';

const stats = [
  {
    icon: Layers,
    value: '10+',
    label: 'Integrated Modules',
    detail: 'Courses, Sessional, Attendance, Timetable, Virtual ID, Fees & More'
  },
  {
    icon: Users,
    value: '6',
    label: 'Dedicated Portal Roles',
    detail: 'Student, Teacher, HOD, Coordinator, Admin & Accountant'
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Verified Virtual ID',
    detail: 'Public QR Code authentication endpoint with tamper-proof security'
  },
  {
    icon: Bot,
    value: '24/7',
    label: 'AI Curriculum Assistant',
    detail: 'Trained on Software Engineering courses & syllabus query resolution'
  },
  {
    icon: Activity,
    value: '99.9%',
    label: 'Real-Time Sync',
    detail: 'Powered by Socket.io for instant notice broadcasts & lecture rooms'
  }
];

export default function StatsSection() {
  return (
    <section id="stats" className="py-20 relative bg-slate-950 text-white overflow-hidden border-y border-amber-500/20">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-amber-400" /> Platform Benchmark
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Built for Academic Scale & Distinction
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Consolidating modern software engineering department operations into one secure, high-performance portal.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all duration-200 group flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight font-sans">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-extrabold text-white mt-1">
                    {stat.label}
                  </p>
                </div>
                
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
                  {stat.detail}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
