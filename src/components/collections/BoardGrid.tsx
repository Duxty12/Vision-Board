'use client';

import React, { useState } from 'react';
import { Plus, LayoutGrid } from 'lucide-react';
import type { Board, BoardWithCount } from '@/lib/types';
import { BoardCard } from './BoardCard';
import { BoardEditorModal } from './BoardEditorModal';

interface BoardGridProps {
  initialBoards: BoardWithCount[];
}

export function BoardGrid({ initialBoards }: BoardGridProps) {
  const [boards, setBoards] = useState<BoardWithCount[]>(initialBoards);
  const [searchQuery, setSearchQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<BoardWithCount | null>(null);

  // Sync state if initialBoards changes from server side
  React.useEffect(() => {
    setBoards(initialBoards);
  }, [initialBoards]);

  const filteredBoards = React.useMemo(() => {
    if (!searchQuery.trim()) return boards;
    return boards.filter((b) => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [boards, searchQuery]);

  const handleEdit = (board: BoardWithCount) => {
    setSelectedBoard(board);
    setEditorOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedBoard(null);
    setEditorOpen(true);
  };

  const handleSaved = (savedBoard: Board) => {
    setBoards((prev) => {
      const idx = prev.findIndex((b) => b.id === savedBoard.id);
      
      // If it was marked default, we must unset it on all others locally
      let updatedBoards = prev;
      if (savedBoard.is_default) {
        updatedBoards = prev.map((b) => ({ ...b, is_default: false } as BoardWithCount));
      }

      if (idx >= 0) {
        const next = [...updatedBoards];
        next[idx] = { ...updatedBoards[idx], ...savedBoard };
        return next;
      } else {
        // Add new board (simulate with card_count = 0)
        return [...updatedBoards, { ...savedBoard, card_count: 0 } as BoardWithCount];
      }
    });
  };

  const handleDeleted = (deletedId: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== deletedId));
  };

  return (
    <>
      {/* ── Header & Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600">
              <LayoutGrid size={18} />
            </div>
            <h1 className="font-display text-2xl font-bold text-stone-900 dark:text-white">Vision Boards</h1>
            <span className="text-xs font-bold font-sans px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              {boards.length} {boards.length === 1 ? 'board' : 'boards'}
            </span>
          </div>
          <p className="text-stone-500 dark:text-stone-400 text-sm font-sans">
            Organise your goals, memories, and inspiration across custom spaces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Filter boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 dark:bg-[#1a1c23] border border-stone-200 dark:border-white/10 text-xs font-sans text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-xs"
            />
            <LayoutGrid size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>

          <button
            id="add-board-btn"
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold font-sans transition-all duration-200 hover:scale-105 shadow-md cursor-pointer shrink-0"
            style={{
              background: 'linear-gradient(135deg, #c07423 0%, #d9902e 100%)',
              boxShadow: '0 4px 14px rgba(192,116,35,0.3)',
            }}
          >
            <Plus size={16} />
            <span>New board</span>
          </button>
        </div>
      </div>

      {/* ── Boards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12 pt-2 px-1">
        {filteredBoards.map((board) => (
          <BoardCard
            key={board.id}
            board={board}
            onEdit={handleEdit}
          />
        ))}

        {/* Add new inline button */}
        <button
          id="boards-add-inline"
          onClick={handleCreateNew}
          className="
            rounded-2xl border-2 border-dashed border-stone-200/80 dark:border-white/10
            hover:border-cork-400 dark:hover:border-cork-800 hover:bg-cork-50/20 dark:hover:bg-[#202128]/20
            flex flex-col items-center justify-center gap-2.5
            text-stone-400 hover:text-cork-600 dark:text-stone-500 dark:hover:text-cork-400
            transition-all duration-200 cursor-pointer
            min-h-[160px] p-6
          "
        >
          <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span className="text-sm font-semibold font-sans">New board</span>
        </button>
      </div>

      {editorOpen && (
        <BoardEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          board={selectedBoard}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
