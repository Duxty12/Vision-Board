import Link from 'next/link';
import {
  Pin,
  Star,
  CheckCircle2,
  Image as ImageIcon,
  Quote,
  Video,
  Sparkles,
  ArrowRight,
  Target,
  CheckSquare,
  Palette,
  Maximize2,
  Mail,
  RotateCw,
  Heart,
  Smile,
  Sun,
  Cloud,
  Layers,
} from 'lucide-react';

// ─── Mini Sticky Note (Hero decoration) ──────────────────────────────────────
function HeroStickyNote({
  color,
  rotation,
  text,
  icon: Icon,
  className = '',
  delay = 'delay-0',
  fontClass = 'font-sans',
}: {
  color: string;
  rotation: string;
  text: string;
  icon: React.ElementType;
  className?: string;
  delay?: string;
  fontClass?: string;
}) {
  return (
    <div
      className={`absolute animate-float ${delay} ${className}`}
      style={{ transform: rotation }}
    >
      <div
        className="sticky-note w-40 p-3.5 rounded-sticky shadow-sticky select-none transition-all duration-300 hover:scale-110 hover:shadow-sticky-hover cursor-pointer"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Icon size={13} className="text-stone-700 shrink-0" />
            <span className={`text-xs font-bold text-stone-800 ${fontClass}`}>
              {text}
            </span>
          </div>
          <Star size={11} className="text-amber-500 fill-amber-400" />
        </div>
        <div className="h-1 rounded-full bg-stone-900/10 mb-1" />
        <div className="h-1 w-2/3 rounded-full bg-stone-900/10" />
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor,
  tag,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accentColor: string;
  tag?: string;
}) {
  return (
    <div className="glass-card p-6 group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-white/60">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          <Icon size={22} className="text-stone-800" />
        </div>
        {tag && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100/70 text-amber-800 font-sans">
            {tag}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-bold text-stone-900 mb-2">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
        {description}
      </p>
    </div>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-4">
      <div className="font-display text-3xl sm:text-4xl font-bold gradient-text">{value}</div>
      <div className="text-xs font-semibold text-stone-500 mt-1 font-sans uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdf8f0] overflow-x-hidden font-sans">

      {/* ── Header Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 backdrop-blur-md bg-[#fdf8f0]/80 border-b border-stone-200/40">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #d9902e, #e4a94a, #f5d08b)' }}
          >
            <Pin size={18} className="text-white rotate-12" />
          </div>
          <span className="font-display font-bold text-xl text-stone-900 tracking-tight">
            StillBoard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            id="nav-sign-in"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 transition-all duration-200"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            id="nav-sign-up"
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:scale-105 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #c07423 0%, #d9902e 50%, #e4a94a 100%)',
              boxShadow: '0 4px 14px rgba(217,144,46,0.35)',
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Background ambient lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-10 right-10 w-96 h-96 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #fde68a, #fca5a5)' }}
          />
          <div
            className="absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #b7f0d4, #bae6fd)' }}
          />
        </div>

        {/* Floating sticky note accents (desktop) */}
        <div className="absolute inset-0 pointer-events-none hidden xl:block">
          <HeroStickyNote
            color="#FFF3B0"
            rotation="rotate(-7deg)"
            text="2026 Goals"
            icon={Target}
            className="top-36 left-8"
            delay="delay-0"
            fontClass="font-handwriting text-sm"
          />
          <HeroStickyNote
            color="#FFB3C6"
            rotation="rotate(5deg)"
            text="Dream Home"
            icon={ImageIcon}
            className="top-28 right-12"
            delay="delay-300"
            fontClass="font-display"
          />
          <HeroStickyNote
            color="#B7F0D4"
            rotation="rotate(-4deg)"
            text="Run 10k Marathon"
            icon={CheckSquare}
            className="bottom-48 left-12"
            delay="delay-500"
            fontClass="font-sans"
          />
          <HeroStickyNote
            color="#E0C3FC"
            rotation="rotate(8deg)"
            text="Daily Gratitude"
            icon={Heart}
            className="bottom-36 right-16"
            delay="delay-150"
            fontClass="font-handwriting text-sm"
          />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold text-amber-900 border border-amber-300/60 bg-amber-100/60 shadow-xs">
            <Sparkles size={14} className="text-amber-600" />
            <span>Private Freeform Vision Board · No Social Feed</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-stone-900 leading-[1.08] tracking-tight mb-6">
            Pin your dreams.
            <br />
            <span className="gradient-text">Watch them come alive.</span>
          </h1>

          <p className="text-base sm:text-xl text-stone-600 leading-relaxed mb-8 max-w-2xl mx-auto font-sans">
            A calm, beautiful space for your goals, tasks, images, quotes, stickers, and videos. Freeform canvas with total focus and privacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              id="hero-cta-primary"
              className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #c07423, #d9902e, #e4a94a)',
                boxShadow: '0 8px 32px rgba(192,116,35,0.35)',
              }}
            >
              <Pin size={18} className="rotate-12" />
              Start your free board
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/sign-in"
              id="hero-cta-secondary"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-stone-800 font-semibold text-base glass-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Sign in to your board
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-12 pt-8 border-t border-stone-300/50">
            <StatBadge value="5" label="Card Types" />
            <StatBadge value="4" label="Board Themes" />
            <StatBadge value="4" label="Custom Fonts" />
            <StatBadge value="100%" label="Private" />
          </div>
        </div>

        {/* ── Realistic Interactive Board Preview Mockup ── */}
        <div className="mt-14 max-w-5xl mx-auto relative animate-slide-up">
          <div className="board-frame relative overflow-hidden rounded-2xl shadow-2xl">
            <div className="board-canvas board-canvas--cork relative p-6 sm:p-10 min-h-[440px] sm:min-h-[500px] flex flex-wrap gap-6 items-start justify-center">
              
              {/* Sample Card 1: Goal Sticky Note */}
              <div className="sticky-note p-4 rounded-sticky w-56 shadow-sticky rotate-[-2deg] transition-all hover:scale-105" style={{ backgroundColor: '#FFF3B0' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-200/60 text-[9px] font-black text-amber-900 uppercase">Goal</span>
                  <Star size={12} className="text-amber-500 fill-amber-400" />
                </div>
                <h4 className="font-display font-bold text-stone-900 text-sm mb-1">Travel to Amalfi Coast 🌊</h4>
                <p className="text-stone-600 text-xs font-sans">Summer cliffside walks & lemon groves.</p>
                <div className="mt-3 pt-2 border-t border-stone-900/10 flex justify-between items-center text-[10px] text-stone-500 font-bold">
                  <span>Target 2026</span>
                  <span className="text-emerald-700">In Progress</span>
                </div>
              </div>

              {/* Sample Card 2: Handwritten Board Text */}
              <div className="p-4 rounded-xl border border-dashed border-stone-400/40 bg-white/10 rotate-[2deg] max-w-xs transition-all hover:scale-105">
                <p className="font-handwriting text-2xl text-stone-900 leading-snug font-medium">
                  "Small daily steps compound into extraordinary dream realities."
                </p>
                <span className="font-sans text-[10px] font-bold text-amber-800 uppercase tracking-widest block mt-2">
                  — Daily Affirmation
                </span>
              </div>

              {/* Sample Card 3: Task Checklist */}
              <div className="sticky-note p-4 rounded-sticky w-56 shadow-sticky rotate-[-1deg] transition-all hover:scale-105" style={{ backgroundColor: '#B7F0D4' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 text-[9px] font-black text-emerald-900 uppercase">Task</span>
                  <CheckSquare size={13} className="text-emerald-700" />
                </div>
                <h4 className="font-display font-bold text-stone-900 text-sm mb-2">Launch Passion Project 🚀</h4>
                <div className="space-y-1.5 text-xs text-stone-800 font-sans">
                  <div className="flex items-center gap-1.5 text-stone-500 line-through">
                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                    <span>Design moodboard & palette</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-stone-400 bg-white" />
                    <span>Finalize canvas features</span>
                  </div>
                </div>
              </div>

              {/* Sample Card 4: Photo Inspiration */}
              <div className="bg-white p-2.5 rounded-lg shadow-sticky rotate-[3deg] w-48 transition-all hover:scale-105 border border-stone-200">
                <div className="relative aspect-video rounded overflow-hidden bg-stone-200 mb-2">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/80 to-rose-400/80 flex items-center justify-center text-white font-display font-bold text-sm">
                    Dream Studio 🎨
                  </div>
                </div>
                <p className="text-[11px] font-bold text-stone-700 font-sans text-center">Sunlit Workspace</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Detailed Features Grid ── */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
            Features Built for Focus
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Everything you need to visualize & achieve
          </h2>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto font-sans">
            Designed to feel tactile, cozy, and completely free from digital noise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Maximize2}
            title="Freeform Responsive Canvas"
            description="Drag, position, scale, and pin your cards freely anywhere on the canvas with full mobile touch support."
            accentColor="#FFF3B0"
            tag="Mobile Ready"
          />
          <FeatureCard
            icon={Quote}
            title="Board Text & Custom Fonts"
            description="Write text directly on the board. Choose from Cozy Handwriting (Caveat), Serif (Lora), Display (Playfair), and Sans fonts."
            accentColor="#E0C3FC"
            tag="Typography"
          />
          <FeatureCard
            icon={Target}
            title="Goals & Milestones"
            description="Pin goals with custom categories, target years, progress badges, and star important cards for gallery view."
            accentColor="#FFB3C6"
          />
          <FeatureCard
            icon={CheckSquare}
            title="Tasks & Subtask Checklists"
            description="Break complex goals into tasks with priority flags, due date badges, subtask checklists, and recurrence rules."
            accentColor="#B7F0D4"
          />
          <FeatureCard
            icon={ImageIcon}
            title="Photos & Video Embeds"
            description="Upload inspiration images directly or paste YouTube links to render interactive media embeds."
            accentColor="#BAE6FD"
          />
          <FeatureCard
            icon={Palette}
            title="4 Canvas Themes & Email Share"
            description="Switch seamlessly between Cork, Linen, White Grid, and Dark Atmosphere, or email snapshot cards directly."
            accentColor="#FFF3B0"
            tag="Themes"
          />
        </div>
      </section>

      {/* ── Canvas Themes Showcase ── */}
      <section className="py-20 px-4 sm:px-8 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Four atmospheres. Your mood.
          </h2>
          <p className="text-stone-400 text-sm sm:text-base mb-12 max-w-xl mx-auto font-sans">
            Customize the surface texture of your vision board with one tap.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'Cork', desc: 'Classic warm corkboard', bg: '#f7eed7', border: '#d0b898' },
              { name: 'Linen', desc: 'Soft woven textured cloth', bg: '#f0e8d8', border: '#c8b898' },
              { name: 'White Grid', desc: 'Clean minimal dot grid', bg: '#ffffff', border: '#e2e8f0' },
              { name: 'Dark Atmosphere', desc: 'Focused dark mode surface', bg: '#1a1b20', border: '#334155' },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all duration-300 hover:scale-105"
              >
                <div
                  className="w-full h-28 rounded-xl mb-3 border shadow-inner"
                  style={{ backgroundColor: t.bg, borderColor: t.border }}
                />
                <h4 className="font-display font-bold text-white text-base">{t.name}</h4>
                <p className="text-xs text-stone-400 font-sans mt-0.5">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="py-24 px-4 sm:px-8 text-center bg-[#fdf8f0]">
        <div className="max-w-2xl mx-auto glass-card p-10 sm:p-14 rounded-3xl border border-white/80 shadow-2xl">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #d9902e, #e4a94a)' }}
          >
            <Pin size={30} className="text-white rotate-12" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Start building your vision today
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mb-8 font-sans leading-relaxed">
            Create your private vision board in less than 30 seconds.
          </p>

          <Link
            href="/sign-up"
            id="bottom-cta"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-105 shadow-xl cursor-pointer"
            style={{
              background: 'gradient(135deg, #c07423, #d9902e, #e4a94a)',
              backgroundColor: '#d9902e',
            }}
          >
            <Sparkles size={18} />
            Create your board free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200/60 py-8 px-4 sm:px-8 bg-[#fdf8f0]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-sans">
          <div className="flex items-center gap-2 font-display font-bold text-stone-800 text-sm">
            <Pin size={16} className="text-amber-600" />
            StillBoard
          </div>
          <p>© {new Date().getFullYear()} StillBoard — Your Personal Vision Board.</p>
        </div>
      </footer>
    </div>
  );
}
