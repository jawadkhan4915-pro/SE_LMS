import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  GraduationCap, 
  Sparkles, 
  ChevronDown, 
  Play, 
  ShieldCheck,
  Zap,
  BookOpen,
  Bot
} from 'lucide-react';

import Navbar from '../components/landing/Navbar';
import Hero3DCanvas from '../components/landing/Hero3DCanvas';
import BentoGrid from '../components/landing/BentoGrid';
import RoleTabs from '../components/landing/RoleTabs';
import HowItWorksTimeline from '../components/landing/HowItWorksTimeline';
import StatsSection from '../components/landing/StatsSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Glassmorphic Sticky Header Navbar */}
      <Navbar />

      {/* Hero Section with 3D Canvas */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 min-h-[92vh] flex items-center justify-center overflow-hidden">
        
        {/* Background Decorative Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/15 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Text & CTAs */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-7 text-center lg:text-left"
            >
              
              {/* Department Announcement Pill */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                </span>
                <span>Department of Software Engineering</span>
                <span className="text-slate-400 dark:text-slate-600">|</span>
                <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Next-Gen LMS
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Software Engineering <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                  Department LMS
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A unified academic platform designed specifically for software engineering education — integrating course resources, live virtual lectures, automated attendance, sessional grading, timetable matrix, AI assistance, and digital virtual ID cards.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="btn-primary py-3.5 px-7 text-base font-bold shadow-lg shadow-indigo-600/30 group"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="btn-secondary py-3.5 px-7 text-base font-bold"
                >
                  <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Portal Login</span>
                </button>
              </div>

              {/* Quick Feature Badges */}
              <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>RBAC Access Scopes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-sky-500" />
                  <span>24/7 AI Assistant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Real-time Timetable & Notices</span>
                </div>
              </div>

            </motion.div>

            {/* Right Column: 3D Canvas Scene */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 h-[380px] sm:h-[450px] lg:h-[520px] relative rounded-3xl overflow-hidden border border-indigo-100/50 dark:border-slate-800/80 bg-gradient-to-b from-indigo-500/5 via-sky-500/5 to-transparent backdrop-blur-xs"
            >
              <Hero3DCanvas />
              
              {/* Floating Badge overlay on 3D scene */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 shadow-lg pointer-events-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-extrabold">Active Department Portal</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Real-time Sessional & Lecture Sync</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live Online
                </span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-semibold animate-bounce pointer-events-none">
          <span>Scroll to explore</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* Feature Highlights Grid (Bento Grid) */}
      <BentoGrid />

      {/* Role-Based Access Section */}
      <RoleTabs />

      {/* How It Works Section */}
      <HowItWorksTimeline />

      {/* Stats Section */}
      <StatsSection />

      {/* Closing CTA Banner */}
      <CtaSection />

      {/* Footer */}
      <Footer />

    </div>
  );
}
