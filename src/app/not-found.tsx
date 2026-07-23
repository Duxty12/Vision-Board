import Link from 'next/link';
import { Pin, Compass, Home, LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdf8f0] dark:bg-[#1a1c23] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #fde68a 0%, #fca5a5 60%, transparent 100%)' }}
        />
      </div>

      {/* Main 404 Card Container */}
      <div className="relative z-10 max-w-lg w-full glass-card p-8 sm:p-12 rounded-3xl border border-white/60 dark:border-white/10 shadow-2xl animate-slide-up">
        
        {/* Floating 404 Corkboard Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-6 shadow-inner relative group">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-rose-500 shadow-md flex items-center justify-center">
            <Pin size={12} className="text-white rotate-12" />
          </div>
          <Compass size={36} className="text-amber-600 dark:text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60 text-amber-800 dark:text-amber-300 text-xs font-bold font-sans mb-4 shadow-xs">
          <Sparkles size={12} className="text-amber-600 animate-pulse" />
          <span>Error 404 · Board Not Found</span>
        </div>

        {/* Heading & Text */}
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white leading-tight mb-3">
          Off the Canvas
        </h1>
        <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed mb-8 font-sans">
          The page or vision board you&apos;re looking for has moved, been unpinned, or doesn&apos;t exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm font-sans transition-all duration-200 hover:scale-105 shadow-md cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #c07423 0%, #d9902e 100%)',
              boxShadow: '0 4px 16px rgba(192,116,35,0.35)',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Go to Dashboard</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-[#282a36] hover:bg-stone-200 dark:hover:bg-[#323545] font-semibold text-xs sm:text-sm font-sans transition-all duration-200 cursor-pointer border border-stone-200 dark:border-white/10"
          >
            <Home size={16} />
            <span>Home Page</span>
          </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-stone-400 text-xs font-sans flex items-center gap-1.5 relative z-10">
        <Pin size={12} className="rotate-12 text-amber-500" />
        <span>StillBoard · Calm Private Vision Boards</span>
      </div>
    </div>
  );
}
