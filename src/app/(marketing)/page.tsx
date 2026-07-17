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
  BookOpen,
} from 'lucide-react';

// ─── Mini Sticky Note (Hero decoration) ──────────────────────────────────────
function HeroStickyNote({
  color,
  rotation,
  text,
  icon: Icon,
  className = '',
  delay = 'delay-0',
}: {
  color: string;
  rotation: string;
  text: string;
  icon: React.ElementType;
  className?: string;
  delay?: string;
}) {
  return (
    <div
      className={`absolute animate-float ${delay} ${className}`}
      style={{ transform: rotation }}
    >
      <div
        className="sticky-note w-36 p-3 rounded-sticky shadow-sticky select-none"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Icon size={13} className="text-stone-600 shrink-0" />
          <span className="text-xs font-semibold text-stone-700 font-sans">
            {text}
          </span>
        </div>
        <div className="h-1 rounded-full bg-stone-300/50 mb-1" />
        <div className="h-1 w-2/3 rounded-full bg-stone-300/40" />
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accentColor: string;
}) {
  return (
    <div className="glass-card p-6 group hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: accentColor }}
      >
        <Icon size={22} className="text-stone-700" />
      </div>
      <h3 className="font-display text-base font-semibold text-stone-800 mb-2">
        {title}
      </h3>
      <p className="text-sm text-stone-500 leading-relaxed font-sans">
        {description}
      </p>
    </div>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────
function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl font-bold gradient-text">{value}</div>
      <div className="text-xs text-stone-500 mt-1 font-sans">{label}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdf8f0] overflow-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <div className="glass-card px-4 py-2.5 flex items-center gap-2.5 rounded-2xl">
          <Pin size={18} className="text-cork-500" />
          <span className="font-display font-bold text-stone-800 tracking-tight">StillBoard</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            id="nav-sign-in"
            className="glass-card px-4 py-2 rounded-xl text-sm font-medium text-stone-700 hover:text-stone-900 transition-all duration-200 hover:shadow-card-hover"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            id="nav-sign-up"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d9902e, #e4a94a)',
              boxShadow: '0 4px 14px rgba(217,144,46,0.4)',
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #fce7f3, #e0c3fc)' }}
          />
          <div
            className="absolute bottom-0 -left-20 w-80 h-80 rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #fef9c3, #fde68a)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #d9902e, transparent)' }}
          />
        </div>

        {/* Floating sticky notes — desktop decoration */}
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <HeroStickyNote
            color="#FFF3B0"
            rotation="rotate(-8deg)"
            text="2026 Goals"
            icon={Target}
            className="top-32 left-12 animate-float"
            delay="delay-0"
          />
          <HeroStickyNote
            color="#FFB3C6"
            rotation="rotate(6deg)"
            text="Learn Piano"
            icon={CheckCircle2}
            className="top-24 right-24 animate-float-slow"
            delay="delay-300"
          />
          <HeroStickyNote
            color="#B7F0D4"
            rotation="rotate(-4deg)"
            text="Read 24 Books"
            icon={BookOpen}
            className="bottom-40 left-20 animate-float-slower"
            delay="delay-500"
          />
          <HeroStickyNote
            color="#E0C3FC"
            rotation="rotate(9deg)"
            text="Dream Home"
            icon={ImageIcon}
            className="bottom-32 right-16 animate-float"
            delay="delay-150"
          />
          <HeroStickyNote
            color="#BAE6FD"
            rotation="rotate(-6deg)"
            text="Health Journey"
            icon={Star}
            className="top-2/3 left-4 animate-float-slow"
            delay="delay-700"
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-sm font-medium text-cork-700 border border-cork-200 bg-cork-50">
            <Sparkles size={14} className="text-cork-500" />
            <span>Your private vision board</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-stone-900 leading-[1.05] tracking-tight mb-6">
            Pin your dreams.
            <br />
            <span className="gradient-text">Live them.</span>
          </h1>

          <p className="text-xl text-stone-500 leading-relaxed mb-10 max-w-xl mx-auto font-sans">
            A calm, private board for your goals, tasks, images, quotes, and videos.
            No algorithm. No social feed. Just&nbsp;you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              id="hero-cta-primary"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #c07423, #d9902e, #e4a94a)',
                boxShadow: '0 8px 32px rgba(192,116,35,0.35)',
              }}
            >
              <Pin size={18} />
              Start for free
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/sign-in"
              id="hero-cta-secondary"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-stone-700 font-medium text-base glass-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
            >
              Sign in to your board
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-12 mt-16 pt-8 border-t border-stone-200/60">
            <StatBadge value="5" label="Card types" />
            <StatBadge value="4" label="Board themes" />
            <StatBadge value="∞" label="Your vision" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-4">
            Everything on one board
          </h2>
          <p className="text-stone-500 text-lg max-w-xl mx-auto font-sans">
            Five card types. One canvas. Zero noise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={Target}
            title="Goals"
            description="Pin your goals as sticky notes. Tag by category, set a target year, track completion, and star your most important ones."
            accentColor="#FFF3B0"
          />
          <FeatureCard
            icon={CheckCircle2}
            title="Tasks"
            description="Break goals into tasks with subtask checklists, priority flags, due dates, and optional recurring schedules."
            accentColor="#B7F0D4"
          />
          <FeatureCard
            icon={ImageIcon}
            title="Images"
            description="Upload inspiration photos directly to your board. Drag, reposition, and resize them freely on the canvas."
            accentColor="#BAE6FD"
          />
          <FeatureCard
            icon={Quote}
            title="Quotes"
            description="Capture words that move you. Display them in a warm serif font on pastel cards with author attribution."
            accentColor="#E0C3FC"
          />
          <FeatureCard
            icon={Video}
            title="Videos"
            description="Paste any YouTube URL. We fetch the thumbnail and embed the player right on your board."
            accentColor="#FFB3C6"
          />
          <FeatureCard
            icon={Sparkles}
            title="Collections"
            description='Group related cards into themed collections — like "2026 Goals", "Home Decor", or "Health Journey".'
            accentColor="#FFF3B0"
          />
        </div>
      </section>

      {/* ── Board Themes Preview ── */}
      <section className="px-6 py-20 bg-gradient-to-br from-stone-900 to-stone-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Four moods. One board.
          </h2>
          <p className="text-stone-400 mb-12 font-sans">
            Switch between Cork, Linen, Gradient, and Dark themes in one click.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Cork', color: '#c8894a', text: 'Warm & earthy' },
              { name: 'Linen', color: '#e8dcc8', text: 'Soft & clean' },
              { name: 'Gradient', color: 'linear-gradient(135deg,#fdf4ff,#eff6ff)', text: 'Dreamy & soft' },
              { name: 'Dark', color: '#1a1c23', text: 'Focused & calm' },
            ].map((theme) => (
              <div
                key={theme.name}
                className="rounded-2xl overflow-hidden border border-white/10 group hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div
                  className="h-24 w-full"
                  style={{ background: theme.color }}
                />
                <div className="p-3 bg-white/5">
                  <div className="text-white font-semibold text-sm font-sans">{theme.name}</div>
                  <div className="text-stone-400 text-xs mt-0.5 font-sans">{theme.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center bg-[#fdf8f0]">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-8 shadow-sticky"
            style={{ background: 'linear-gradient(135deg, #d9902e, #e4a94a)' }}>
            <Pin size={28} className="text-white" />
          </div>
          <h2 className="font-display text-4xl font-bold text-stone-900 mb-4">
            Ready to build your vision?
          </h2>
          <p className="text-stone-500 mb-10 text-lg font-sans">
            Create your free board in under 30 seconds. No credit card required.
          </p>
          <Link
            href="/sign-up"
            id="bottom-cta"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white font-semibold text-base transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #c07423, #d9902e, #e4a94a)',
              boxShadow: '0 8px 32px rgba(192,116,35,0.35)',
            }}
          >
            <Sparkles size={18} />
            Create your board
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-200 px-6 py-8 bg-[#fdf8f0]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Pin size={16} className="text-cork-500" />
            <span className="font-display font-bold text-stone-700 text-sm">StillBoard</span>
          </div>
          <p className="text-xs text-stone-400 font-sans">
            Built for dreamers who do.
          </p>
        </div>
      </footer>
    </div>
  );
}
