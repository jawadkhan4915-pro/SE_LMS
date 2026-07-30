import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Crown, Sparkles } from 'lucide-react';

export default function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative bg-slate-950/90 backdrop-blur-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border border-amber-500/30">
          
          {/* Animated Glow Backdrops */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-extrabold uppercase tracking-wider">
              <Crown className="w-4 h-4 text-amber-400" /> Department Digital Transformation
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Upgrade to Oxford-Grade Learning Management Today
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Join students, faculty, and administrators using SE-LMS for seamless course management, automated attendance, and real-time sessional tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={() => navigate('/register')}
                className="px-7 py-4 rounded-xl font-extrabold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl shadow-amber-500/25 group w-full sm:w-auto justify-center flex items-center gap-2"
              >
                <span>Create Student / Faculty Account</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-slate-950" />
              </button>

              <button
                onClick={() => navigate('/login')}
                className="px-7 py-4 rounded-xl font-extrabold text-base text-white bg-slate-900 border border-slate-700 hover:border-amber-500/40 w-full sm:w-auto justify-center flex items-center gap-2"
              >
                <GraduationCap className="w-5 h-5 text-amber-400" />
                <span>Existing User Login</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
