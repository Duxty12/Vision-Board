'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, LayoutGrid, Trash2 } from 'lucide-react';
import type { Board, BoardTheme } from '@/lib/types';
import { createBoard, updateBoard, deleteBoard } from '@/lib/actions/boards';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface BoardEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  board?: Board | null; // Null if creating
  onSaved?: (board: Board) => void;
  onDeleted?: (boardId: string) => void;
}

const THEME_OPTIONS: { value: BoardTheme; label: string; preview: string }[] = [
  { value: 'cork',     label: 'Cork Wood',   preview: 'bg-[#f4ebd0]' },
  { value: 'linen',    label: 'Soft Linen',  preview: 'bg-[#f0e8d8]' },
  { value: 'white',    label: 'White Board', preview: 'bg-[#ffffff] border border-stone-200' },
  { value: 'dark',     label: 'Dark Mode',   preview: 'bg-[#1a1c23]' },
];

export function BoardEditorModal({
  isOpen,
  onClose,
  board = null,
  onSaved,
  onDeleted,
}: BoardEditorModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<BoardTheme>('cork');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (board) {
        setTitle(board.title);
        setTheme(board.theme);
      } else {
        setTitle('');
        setTheme('cork');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, board]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Board title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (board) {
        // Edit Mode
        const updated = await updateBoard(board.id, {
          title: title.trim(),
          theme,
        });
        onSaved?.(updated);
      } else {
        // Create Mode
        const created = await createBoard({
          title: title.trim(),
          theme,
        });
        onSaved?.(created);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving board:', err);
      setError(err.message || 'Failed to save board.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!board) return;
    setLoading(true);
    setError(null);

    try {
      await deleteBoard(board.id);
      onDeleted?.(board.id);
      onClose();
    } catch (err: any) {
      console.error('Error deleting board:', err);
      setError(err.message || 'Failed to delete board.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 dark:bg-[#1a1c23]/95 border border-stone-200/50 dark:border-white/10 p-6 text-left shadow-2xl transition-all duration-300 scale-100 animate-slide-up backdrop-blur-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200/60 dark:border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-cork-500" size={18} />
            <h3 className="font-display text-lg font-bold text-stone-900 dark:text-white leading-tight">
              {board ? 'Edit Vision Board' : 'Create New Vision Board'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#2b2d38] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-5 pr-1 py-1 no-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/30 text-red-650 dark:text-red-300 text-xs font-sans font-medium flex items-center gap-2.5">
              <span>{error}</span>
            </div>
          )}

          {/* Title field */}
          <div className="space-y-1.5">
            <label htmlFor="board-title" className="text-xs font-bold font-sans uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Board Title
            </label>
            <input
              id="board-title"
              type="text"
              placeholder="e.g. Travel Dreams, 2026 Focus..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-white/50 dark:bg-[#1a1c23]/50 focus:bg-white dark:focus:bg-[#1a1c23] focus:ring-2 focus:ring-cork-400 text-stone-850 dark:text-white placeholder:text-stone-400 text-sm font-sans font-medium transition-all"
              autoFocus
              disabled={loading}
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-sans uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Board Theme
            </label>
            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-xl border-2 text-left transition-all duration-200
                    ${theme === opt.value
                      ? 'border-cork-500 bg-cork-50/40 dark:bg-cork-950/10'
                      : 'border-stone-200/80 dark:border-white/5 hover:border-stone-300 hover:bg-stone-50/50 dark:hover:bg-stone-900/50'
                    }
                  `}
                  disabled={loading}
                >
                  <div className={`w-10 h-7 rounded-lg ${opt.preview} border border-stone-200/60 shadow-sm shrink-0`} />
                  <div>
                    <p className="text-xs font-bold font-sans text-stone-800 dark:text-stone-200 leading-none">{opt.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200/60 dark:border-white/10 shrink-0 mt-6">
            {board && !board.is_default ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold font-sans text-red-650 hover:text-red-750 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                disabled={loading}
              >
                <Trash2 size={14} />
                Delete Board
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold font-sans rounded-xl border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 text-xs font-bold font-sans rounded-xl text-white transition-all shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #c07423, #d9902e)',
                  boxShadow: '0 4px 12px rgba(192,116,35,0.2)',
                }}
                disabled={loading}
              >
                {loading ? 'Saving...' : board ? 'Save Changes' : 'Create Board'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirm Delete Dialog */}
      {showConfirmDelete && (
        <ConfirmModal
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Vision Board"
          message={`Are you sure you want to delete "${board?.title}"? All cards, stickers, and media on this board will be permanently deleted.`}
          confirmText="Yes, Delete Board"
          cancelText="No, Keep It"
          isDestructive={true}
        />
      )}
    </div>,
    document.body
  );
}
