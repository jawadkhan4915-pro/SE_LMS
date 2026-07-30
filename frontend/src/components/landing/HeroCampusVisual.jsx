import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  CheckCircle2,
  Crown,
  Award
} from 'lucide-react';

export default function HeroCampusVisual() {
  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] flex items-center justify-center p-2 sm:p-4">
      
      {/* Background Radial Luxury Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-indigo-600/20 to-transparent rounded-3xl blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Photo Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full h-full rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950 group"
      >
        {/* Oxford University Image */}
        <img
          src="/images/oxford_university.png"
          alt="Oxford University Radcliffe Camera - SE-LMS Academic Distinction"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 brightness-[0.85] contrast-[1.05]"
        />

        {/* Gradient Vignette & Accent Glow Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
        <div className="absolute inset-0 bg-indigo-950/25 mix-blend-overlay" />

        {/* Top Header Badge Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs font-extrabold shadow-lg">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Oxford Academic Standard</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Department Portal
          </div>
        </div>

        {/* Floating Interactive Badge 1: AI Assistant */}
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 right-5 z-20 p-3 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/30 shadow-2xl max-w-[210px] hidden sm:flex items-center gap-3 text-white"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-bold">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-amber-200">24/7 AI Assistant</p>
            <p className="text-[10px] text-slate-400">Curriculum Solver</p>
          </div>
        </motion.div>

        {/* Floating Interactive Badge 2: QR Virtual ID */}
        <motion.div 
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-20 left-5 z-20 p-3 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 shadow-2xl max-w-[230px] hidden sm:flex items-center gap-3 text-white"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-extrabold text-indigo-300">Digital Virtual ID</p>
            <p className="text-[10px] text-slate-400">Cryptographic QR Security</p>
          </div>
        </motion.div>

        {/* Bottom Headline Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 z-10 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Software Engineering Distinction</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
            Flagship Learning Management System
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
            Integrating Oxford-tier academic excellence with automated sessional grading, live lecture halls, timetable matrices, and AI study assistants.
          </p>

          <div className="flex items-center gap-4 pt-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 10 Integrated Modules
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> 6 Portal Roles
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
