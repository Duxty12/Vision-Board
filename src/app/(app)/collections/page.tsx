import type { Metadata } from 'next';
import { FolderOpen, Plus, MoreHorizontal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Collections',
};

// ─── Placeholder collection card ──────────────────────────────────────────────
function CollectionCardSkeleton({
  name,
  color,
  count,
}: {
  name: string;
  color: string;
  count: number;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Color swatch header */}
      <div
        className="h-3 w-full transition-all duration-300 group-hover:h-4"
        style={{ backgroundColor: color }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${color}60` }}
          >
            <FolderOpen size={18} style={{ color: 'hsl(30,20%,40%)' }} />
          </div>
          <button
            className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Collection options"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>

        <h3 className="font-display font-semibold text-stone-800 mb-1 text-sm">{name}</h3>
        <p className="text-xs text-stone-400 font-sans">
          {count} {count === 1 ? 'card' : 'cards'}
        </p>
      </div>
    </div>
  );
}

// ─── Placeholder data ─────────────────────────────────────────────────────────
const PLACEHOLDER_COLLECTIONS = [
  { name: '2026 Goals',    color: '#FFF3B0', count: 8  },
  { name: 'Home Decor',    color: '#FFB3C6', count: 5  },
  { name: 'Health Journey',color: '#B7F0D4', count: 12 },
  { name: 'Career',        color: '#BAE6FD', count: 4  },
  { name: 'Travel Dreams', color: '#E0C3FC', count: 7  },
  { name: 'Inspiration',   color: '#FFD8B1', count: 3  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CollectionsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <FolderOpen size={22} className="text-cork-500" />
            <h1 className="font-display text-2xl font-bold text-stone-900">Collections</h1>
          </div>
          <p className="text-stone-500 text-sm font-sans">
            Group your cards into themed collections.
          </p>
        </div>
        <button
          id="add-collection-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold font-sans transition-all duration-200 hover:scale-105 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #c07423, #d9902e)',
            boxShadow: '0 4px 14px rgba(192,116,35,0.3)',
          }}
        >
          <Plus size={16} />
          New collection
        </button>
      </div>

      {/* ── Collections grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {PLACEHOLDER_COLLECTIONS.map((col) => (
          <CollectionCardSkeleton key={col.name} {...col} />
        ))}

        {/* Add new */}
        <button
          id="collections-add-inline"
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
          <span className="text-sm font-medium font-sans">New collection</span>
        </button>
      </div>
    </div>
  );
}
