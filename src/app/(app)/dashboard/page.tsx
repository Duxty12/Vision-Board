import type { Metadata } from 'next';
import {
  Sparkles,
  Plus,
  Target,
  CheckSquare,
  Image as ImageIcon,
  Quote,
  Video,
  Star,
  Sticker,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard',
};

// ─── Quick add types ──────────────────────────────────────────────────────────
const CARD_TYPES = [
  { icon: Target,    label: 'Goal',    color: '#FFF3B0', id: 'add-goal' },
  { icon: CheckSquare, label: 'Task', color: '#B7F0D4', id: 'add-task' },
  { icon: ImageIcon, label: 'Image',   color: '#BAE6FD', id: 'add-image' },
  { icon: Quote,     label: 'Quote',   color: '#E0C3FC', id: 'add-quote' },
  { icon: Video,     label: 'Video',   color: '#FFB3C6', id: 'add-video' },
  { icon: Sticker,   label: 'Sticker', color: '#FECDD3', id: 'add-sticker' },
] as const;

// ─── Placeholder sticky note ──────────────────────────────────────────────────
function PlaceholderNote({
  color,
  rotation,
  className = '',
}: {
  color: string;
  rotation: string;
  className?: string;
}) {
  return (
    <div
      className={`w-40 h-40 rounded-sticky shadow-sticky opacity-60 select-none ${className}`}
      style={{ backgroundColor: color, transform: rotation }}
    >
      <div className="p-4">
        <div className="h-2 bg-stone-300/50 rounded-full mb-2 w-3/4" />
        <div className="h-2 bg-stone-300/40 rounded-full mb-2 w-full" />
        <div className="h-2 bg-stone-300/30 rounded-full w-2/3" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="relative min-h-[calc(100vh-60px)] board-canvas board-canvas--cork p-6">

      {/* ── Featured strip ── */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Star size={15} className="text-cork-400" />
          <h2 className="text-sm font-semibold text-white/80 font-sans tracking-wide uppercase">
            Starred
          </h2>
        </div>
        <div className="featured-strip gap-3">
          {/* Empty state — strip placeholder cards */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-48 h-24 rounded-xl bg-white/20 border border-white/20 animate-pulse backdrop-blur-sm"
            />
          ))}
        </div>
      </section>

      {/* ── Freeform canvas area ── */}
      <div
        id="board-canvas"
        className="relative w-full"
        style={{ minHeight: '600px' }}
      >
        {/* Decorative placeholder sticky notes */}
        <div className="absolute top-12 left-16">
          <PlaceholderNote color="#FFF3B0" rotation="rotate(-3deg)" />
        </div>
        <div className="absolute top-6 left-64">
          <PlaceholderNote color="#FFB3C6" rotation="rotate(2deg)" />
        </div>
        <div className="absolute top-40 left-40">
          <PlaceholderNote color="#B7F0D4" rotation="rotate(-1.5deg)" />
        </div>
        <div className="absolute top-8 left-[480px]">
          <PlaceholderNote color="#E0C3FC" rotation="rotate(3.5deg)" />
        </div>
        <div className="absolute top-44 left-[400px]">
          <PlaceholderNote color="#BAE6FD" rotation="rotate(-2deg)" />
        </div>

        {/* ── Empty state overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center glass-card p-10 rounded-2xl max-w-sm mx-auto">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4 shadow-sticky"
              style={{ background: 'linear-gradient(135deg, #d9902e, #e4a94a)' }}>
              <Sparkles size={28} className="text-white" />
            </div>
            <h3 className="font-display text-xl font-bold text-stone-800 mb-2">
              Your board is empty
            </h3>
            <p className="text-stone-500 text-sm mb-6 font-sans leading-relaxed">
              Start pinning your goals, dreams, and ideas. Hit the{' '}
              <strong className="text-stone-700">+ Add card</strong> button to begin.
            </p>

            {/* Quick add chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CARD_TYPES.map(({ icon: Icon, label, color, id }) => (
                <button
                  key={label}
                  id={id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans text-stone-700 border border-stone-200 hover:scale-105 hover:shadow-sticky transition-all duration-200"
                  style={{ backgroundColor: color }}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating FAB ── */}
      <button
        id="fab-add-card"
        aria-label="Add new card"
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-200 z-30"
        style={{
          background: 'linear-gradient(135deg, #c07423, #d9902e)',
          boxShadow: '0 8px 32px rgba(192,116,35,0.5)',
        }}
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
