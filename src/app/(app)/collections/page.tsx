import type { Metadata } from 'next';
import { LayoutGrid, Plus, Star, MoreHorizontal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vision Boards',
};

// ─── Placeholder board card (Phase 5 will replace with real BoardCard.tsx) ─────
function BoardCardSkeleton({
  title,
  theme,
  count,
  isStarred,
  isDefault,
}: {
  title: string;
  theme: string;
  count: number;
  isStarred?: boolean;
  isDefault?: boolean;
}) {
  const themeColors: Record<string, string> = {
    cork: '#C09060',
    linen: '#E8DCC8',
    gradient: '#9B7FD4',
    dark: '#2C2C2C',
  };
  const swatch = themeColors[theme] ?? themeColors.cork;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Theme swatch header */}
      <div
        className="h-10 w-full transition-all duration-300 group-hover:h-12 flex items-center justify-end pr-3"
        style={{ backgroundColor: swatch }}
      >
        {isDefault && (
          <span className="text-[10px] font-bold font-sans px-2 py-0.5 rounded-full bg-white/30 text-white">
            Default
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${swatch}40` }}
          >
            <LayoutGrid size={18} style={{ color: 'hsl(30,20%,40%)' }} />
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isStarred
                  ? 'text-amber-500'
                  : 'text-stone-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
              }`}
              aria-label={isStarred ? 'Unstar board' : 'Star board'}
            >
              <Star size={14} className={isStarred ? 'fill-amber-500' : ''} />
            </button>
            <button
              className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Board options"
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        <h3 className="font-display font-semibold text-stone-800 mb-1 text-sm">{title}</h3>
        <p className="text-xs text-stone-400 font-sans">
          {count} {count === 1 ? 'card' : 'cards'}
        </p>
      </div>
    </div>
  );
}

// ─── Placeholder data ─────────────────────────────────────────────────────────
const PLACEHOLDER_BOARDS = [
  { title: 'My Vision Board', theme: 'cork',     count: 14, isDefault: true,  isStarred: true  },
  { title: 'Home & Living',   theme: 'linen',    count: 7,  isDefault: false, isStarred: true  },
  { title: 'Career Goals',    theme: 'gradient', count: 5,  isDefault: false, isStarred: false },
  { title: 'Travel Dreams',   theme: 'dark',     count: 9,  isDefault: false, isStarred: false },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <LayoutGrid size={22} className="text-cork-500" />
            <h1 className="font-display text-2xl font-bold text-stone-900">Vision Boards</h1>
          </div>
          <p className="text-stone-500 text-sm font-sans">
            Organise your goals, memories, and inspiration across multiple boards.
          </p>
        </div>
        <button
          id="add-board-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold font-sans transition-all duration-200 hover:scale-105 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #c07423, #d9902e)',
            boxShadow: '0 4px 14px rgba(192,116,35,0.3)',
          }}
        >
          <Plus size={16} />
          New board
        </button>
      </div>

      {/* ── Boards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {PLACEHOLDER_BOARDS.map((board) => (
          <BoardCardSkeleton key={board.title} {...board} />
        ))}

        {/* Add new inline */}
        <button
          id="boards-add-inline"
          className="
            rounded-2xl border-2 border-dashed border-stone-200
            hover:border-cork-400 hover:bg-cork-50
            flex flex-col items-center justify-center gap-2.5
            text-stone-400 hover:text-cork-600
            transition-all duration-200 cursor-pointer
            min-h-[140px] p-6
          "
        >
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span className="text-sm font-medium font-sans">New board</span>
        </button>
      </div>
    </div>
  );
}
