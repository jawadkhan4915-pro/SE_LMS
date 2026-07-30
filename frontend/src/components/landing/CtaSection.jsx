import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-2xl border border-indigo-500/30">
          
          {/* Animated Glow Backdrops */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-sky-300 border border-white/15 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Department Digital Transformation
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Upgrade Your Academic Experience?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Join students, faculty, and administrators already using SE-LMS for seamless learning management, automated attendance, and real-time sessional tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => navigate('/register')}
                className="btn-primary py-3.5 px-6 text-base font-bold shadow-lg shadow-indigo-600/40 group w-full sm:w-auto justify-center"
              >
                <span>Create Student / Faculty Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="btn-secondary py-3.5 px-6 text-base font-bold bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white w-full sm:w-auto justify-center"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Existing User Login</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
