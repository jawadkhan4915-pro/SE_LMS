import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  GraduationCap, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck,
  Zap,
  Bot,
  Crown
} from 'lucide-react';

import Navbar from '../components/landing/Navbar';
import HeroCampusVisual from '../components/landing/HeroCampusVisual';
import BentoGrid from '../components/landing/BentoGrid';
import RoleTabs from '../components/landing/RoleTabs';
import HowItWorksTimeline from '../components/landing/HowItWorksTimeline';
import StatsSection from '../components/landing/StatsSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Full-Viewport Oxford University Background Image with Dark Luxury Vignette Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/oxford_university.png"
          alt="Oxford University Radcliffe Camera Background"
          className="w-full h-full object-cover object-center scale-105 filter blur-xs brightness-[0.35] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-color-dodge" />
      </div>

      <div className="relative z-10">
        
        {/* Glassmorphic Sticky Header Navbar */}
        <Navbar />

        {/* Hero Section with Oxford Visual */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 min-h-[92vh] flex items-center justify-center overflow-hidden">
          
          {/* Background Decorative Gold/Indigo Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-indigo-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

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
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-extrabold shadow-xl">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Department of Software Engineering</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-amber-300 flex items-center gap-1 font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-400" /> Oxford Distinction
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  Software Engineering <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                    Department LMS
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  A flagship academic platform engineered with Oxford distinction — integrating course resources, live virtual lectures, automated attendance, sessional grading, smart timetables, AI study assistance, and digital virtual ID cards.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <button
                    onClick={() => navigate('/register')}
                    className="px-7 py-4 rounded-xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 group w-full sm:w-auto justify-center flex items-center gap-2"
                  >
                    <span>Get Started Now</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-950" />
                  </button>

                  <button
                    onClick={() => navigate('/login')}
                    className="px-7 py-4 rounded-xl font-extrabold text-base text-white bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/40 w-full sm:w-auto justify-center flex items-center gap-2"
                  >
                    <GraduationCap className="w-5 h-5 text-amber-400" />
                    <span>Portal Login</span>
                  </button>
                </div>

                {/* Quick Feature Badges */}
                <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>RBAC Access Scopes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-amber-400" />
                    <span>24/7 AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span>Real-time Timetable & Notices</span>
                  </div>
                </div>

              </motion.div>

              {/* Right Column: Oxford Campus Visual */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-5"
              >
                <HeroCampusVisual />
              </motion.div>

            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-xs font-bold animate-bounce pointer-events-none">
            <span>Scroll to explore</span>
            <ChevronDown className="w-4 h-4 text-amber-400" />
          </div>
        </section>

        {/* Feature Highlights Grid */}
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

    </div>
  );
}
