import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  CheckCircle2,
  Award
} from 'lucide-react';

export default function HeroCampusVisual() {
  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex items-center justify-center p-2 sm:p-4">
      
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 via-sky-500/15 to-transparent rounded-3xl blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Photo Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full h-full rounded-3xl overflow-hidden border border-indigo-200/50 dark:border-slate-800/80 shadow-2xl bg-slate-900 group"
      >
        {/* Oxford University Image */}
        <img
          src="/images/oxford_university.png"
          alt="Oxford University Radcliffe Camera - SE-LMS Academic Excellence"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-[0.9] dark:brightness-[0.8]"
        />

        {/* Gradient Vignette & Accent Glow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay" />

        {/* Top Header Badge Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Oxford Academic Standard</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Department Portal
          </div>
        </div>

        {/* Floating Interactive Badge 1: AI Assistant (Top Right Floating) */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 right-5 z-20 p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700 shadow-xl max-w-[200px] hidden sm:flex items-center gap-3 text-slate-900 dark:text-white"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">24/7 AI Assistant</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Curriculum Solver</p>
          </div>
        </motion.div>

        {/* Floating Interactive Badge 2: QR ID Verification (Bottom Left Floating) */}
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-20 left-5 z-20 p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 dark:border-slate-700 shadow-xl max-w-[220px] hidden sm:flex items-center gap-3 text-slate-900 dark:text-white"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Digital Virtual ID</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Cryptographic QR Verification</p>
          </div>
        </motion.div>

        {/* Bottom Headline Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-10 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Software Engineering Excellence</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
            World-Class Academic Management System
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Combining Oxford-level academic rigor with automated sessional grading, live lecture halls, smart timetabling, and AI learning tools.
          </p>

          <div className="flex items-center gap-4 pt-2 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 10 Integrated Modules
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <Sparkles className="w-3.5 h-3.5" /> 6 Portal User Roles
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
