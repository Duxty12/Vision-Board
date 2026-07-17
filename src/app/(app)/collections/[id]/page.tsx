import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid, Plus, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vision Board Canvas',
};

interface PageProps {
  params: { id: string };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BoardCanvasPage({ params }: PageProps) {
  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* ── Breadcrumb + Header ── */}
      <div className="mb-8">
        <Link
          href="/collections"
          id="back-to-boards"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 text-sm font-medium font-sans mb-4 transition-colors duration-200 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Vision Boards
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Board theme swatch icon */}
            <div
              className="w-12 h-12 rounded-2xl shadow-sticky flex items-center justify-center"
              style={{ backgroundColor: '#C09060' }}
            >
              <LayoutGrid size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-stone-900">
                Vision Board
              </h1>
              <p className="text-stone-400 text-xs font-sans mt-0.5">
                ID: {params.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Star toggle */}
            <button
              id="board-star-toggle"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:text-amber-500 hover:bg-amber-50 transition-all duration-200"
              aria-label="Star this board"
            >
              <Star size={18} />
            </button>

            <button
              id="add-card-to-board"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold font-sans transition-all duration-200 hover:scale-105 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #c07423, #d9902e)',
                boxShadow: '0 4px 14px rgba(192,116,35,0.3)',
              }}
            >
              <Plus size={16} />
              Add card
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-4">
        {['All', 'Goals', 'Tasks', 'Images', 'Quotes', 'Videos'].map((type, i) => (
          <button
            key={type}
            id={`board-tab-${type.toLowerCase()}`}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200
              ${i === 0
                ? 'bg-cork-500 text-white'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>

      {/* ── Empty state ── */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sticky"
          style={{ backgroundColor: '#C09060' }}
        >
          <LayoutGrid size={28} className="text-white" />
        </div>
        <h2 className="font-display text-lg font-semibold text-stone-800 mb-2">
          This board is empty
        </h2>
        <p className="text-stone-400 text-sm mb-6 max-w-xs font-sans">
          Add goals, tasks, images, quotes, or videos to bring this vision board to life.
        </p>
        <button
          id="board-add-first-card"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold font-sans transition-all duration-200 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #c07423, #d9902e)',
            boxShadow: '0 4px 14px rgba(192,116,35,0.3)',
          }}
        >
          <Plus size={16} />
          Add first card
        </button>
      </div>
    </div>
  );
}
