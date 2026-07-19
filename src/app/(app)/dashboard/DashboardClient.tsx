'use client';

import React, { useState, useTransition, useMemo, useEffect } from 'react';
import { Star, Sparkles, Eye, Edit3, FolderOpen, Pin, X, Maximize2, Check, ChevronDown, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Board, CardWithRelations, Sticker, CardType, StickerType, BoardTheme, BoardWithCount } from '@/lib/types';
import { BoardCanvas } from '@/components/board/BoardCanvas';
import { FeaturedStrip } from '@/components/board/FeaturedStrip';
import { FeaturedBoardsStrip } from '@/components/board/FeaturedBoardsStrip';
import { QuickAddMenu } from '@/components/board/QuickAddMenu';
import { ThemeSwitcher } from '@/components/board/ThemeSwitcher';
import { CardEditorModal } from '@/components/cards/CardEditorModal';
import { CardExpandedView } from '@/components/cards/CardExpandedView';
import { toggleCardCompleted, toggleCardStarred, updateCardPosition } from '@/lib/actions/cards';
import { addSticker, deleteSticker } from '@/lib/actions/stickers';
import { toggleSubtaskCompleted } from '@/lib/actions/subtasks';
import SendEmailButton from '@/components/settings/SendEmailButton';

interface DashboardClientProps {
  board: Board;
  initialCards: CardWithRelations[];
  initialStickers: Sticker[];
  starredCards: CardWithRelations[];
  allUserCards?: CardWithRelations[];
  boards?: BoardWithCount[];
  starredBoards?: BoardWithCount[];
  backLink?: string;
}

type BoardSize = 'compact' | 'standard' | 'large' | 'widescreen' | 'portrait-sm' | 'portrait-lg' | 'tall';

const SIZE_PRESETS: { value: BoardSize; label: string; widthClass: string; height: string }[] = [
  { value: 'compact',     label: 'Compact',      widthClass: 'max-w-4xl',  height: '640px'  },
  { value: 'standard',    label: 'Standard',     widthClass: 'max-w-5xl',  height: '760px'  },
  { value: 'large',       label: 'Large',        widthClass: 'max-w-6xl',  height: '860px'  },
  { value: 'widescreen',  label: 'Widescreen',   widthClass: 'max-w-7xl',  height: '960px'  },
  { value: 'portrait-sm', label: 'Portrait S',   widthClass: 'max-w-lg',   height: '900px'  },
  { value: 'portrait-lg', label: 'Portrait L',   widthClass: 'max-w-xl',   height: '1100px' },
  { value: 'tall',        label: 'Tall Scroll',  widthClass: 'max-w-5xl',  height: '1400px' },
];

export function DashboardClient({
  board,
  initialCards,
  initialStickers,
  starredCards: initialStarredCards,
  allUserCards,
  boards,
  starredBoards,
  backLink,
}: DashboardClientProps) {
  const router = useRouter();
  const [boardDropdownOpen, setBoardDropdownOpen] = useState(false);
  const [cards, setCards] = useState<CardWithRelations[]>(initialCards);
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  const [starredCards, setStarredCards] = useState<CardWithRelations[]>(initialStarredCards);
  const [currentTheme, setCurrentTheme] = useState<BoardTheme>(board.theme);
  const [, startTransition] = useTransition();

  // Control modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Board Size options
  const [boardSize, setBoardSize] = useState<BoardSize>('large');
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);

  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardWithRelations | null>(null);
  const [addingType, setAddingType] = useState<CardType | null>(null);
  const [addingIsBoardText, setAddingIsBoardText] = useState(false);

  // Sync state when props change (smart merge — preserve local positional/dimensional state
  // that may be ahead of the server, to avoid reverting optimistic canvas edits).
  React.useEffect(() => {
    setCards((prev) => {
      // Build a lookup of local card data to preserve in-flight edits
      const localById = new Map(prev.map((c) => [c.id, c]));
      return initialCards.map((serverCard) => {
        const local = localById.get(serverCard.id);
        if (!local) return serverCard;
        // Keep local positional/dimensional values if they differ from server
        // (they may not yet be persisted). Overwrite all other fields from server.
        return {
          ...serverCard,
          position_x: local.position_x,
          position_y: local.position_y,
          z_index: local.z_index ?? serverCard.z_index,
          width: local.width,
          height: local.height,
        };
      });
    });
  }, [initialCards]);
  React.useEffect(() => { setStickers(initialStickers); }, [initialStickers]);
  React.useEffect(() => { setStarredCards(initialStarredCards); }, [initialStarredCards]);
  // ── Sync theme when switching to a different board ─────────────────────────
  React.useEffect(() => { setCurrentTheme(board.theme); }, [board.id, board.theme]);

  // Load board size preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`stillboard_size_${board.id}`) as BoardSize;
      const valid: BoardSize[] = ['compact','standard','large','widescreen','portrait-sm','portrait-lg','tall'];
      if (saved && valid.includes(saved)) {
        setBoardSize(saved);
      }
    }
  }, [board.id]);

  const handleSizeChange = (size: BoardSize) => {
    setBoardSize(size);
    setSizeMenuOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`stillboard_size_${board.id}`, size);
    }
  };

  // Separate pinned vs unpinned cards
  const pinnedCards = useMemo(() => {
    return cards.filter((c) => c.position_x > 0 || c.position_y > 0);
  }, [cards]);

  // Unpinned: board-specific unpinned + all user goals/tasks not already in board
  const unpinnedCards = useMemo(() => {
    const boardCardIds = new Set(cards.map((c) => c.id));
    const boardUnpinned = cards.filter((c) => c.position_x === 0 && c.position_y === 0);
    // Merge in user-wide goal/task cards that don't belong to this board canvas
    const crossBoardCards = (allUserCards || []).filter(
      (c) => !boardCardIds.has(c.id) && (c.type === 'goal' || c.type === 'task')
    );
    return [...boardUnpinned, ...crossBoardCards];
  }, [cards, allUserCards]);

  const handleCardClick = (card: CardWithRelations) => {
    setSelectedCard(card);
    if (isEditMode) {
      setAddingType(null);
      setEditorOpen(true);
    } else {
      setViewerOpen(true);
    }
  };

  const handleOpenNewEditor = (type: CardType, isBoardText?: boolean) => {
    setSelectedCard(null);
    setAddingType(type);
    setAddingIsBoardText(!!isBoardText);
    setEditorOpen(true);
  };

  const handleModalSave = (savedCard: CardWithRelations) => {
    setCards((prev) => {
      const idx = prev.findIndex((c) => c.id === savedCard.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedCard;
        return next;
      }
      return [...prev, savedCard];
    });
    // sync starred
    if (savedCard.is_starred) {
      setStarredCards((prev) => {
        const idx = prev.findIndex((c) => c.id === savedCard.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = savedCard;
          return next;
        }
        return [savedCard, ...prev];
      });
    } else {
      setStarredCards((prev) => prev.filter((c) => c.id !== savedCard.id));
    }
    setEditorOpen(false);
  };

  const handleModalDelete = (deletedId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== deletedId));
    setStarredCards((prev) => prev.filter((c) => c.id !== deletedId));
    setEditorOpen(false);
  };

  const handleToggleCompleted = (id: string) => {
    // Optimistic update first — immediate UI feedback
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, is_completed: !c.is_completed } : c));
    setStarredCards((prev) => prev.map((c) => c.id === id ? { ...c, is_completed: !c.is_completed } : c));
    if (selectedCard?.id === id) {
      setSelectedCard((prev) => prev ? { ...prev, is_completed: !prev.is_completed } : null);
    }
    // Fire server action in background (no startTransition to avoid deferral delay)
    void (async () => {
      try {
        const updated = await toggleCardCompleted(id);
        // Reconcile with actual server value in case it differs
        const mapFn = (c: CardWithRelations) => c.id === id ? { ...c, is_completed: updated.is_completed } : c;
        setCards((prev) => prev.map(mapFn));
        setStarredCards((prev) => prev.map(mapFn));
        if (selectedCard?.id === id) {
          setSelectedCard((prev) => prev ? { ...prev, is_completed: updated.is_completed } : null);
        }
      } catch {}
    })();
  };

  const handleToggleStarred = (id: string) => {
    // Optimistic update first
    const isCurrentlyStarred = cards.find((c) => c.id === id)?.is_starred ?? false;
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, is_starred: !c.is_starred } : c));
    if (!isCurrentlyStarred) {
      const card = cards.find((c) => c.id === id);
      if (card) setStarredCards((prev) => [{ ...card, is_starred: true }, ...prev.filter((c) => c.id !== id)]);
    } else {
      setStarredCards((prev) => prev.filter((c) => c.id !== id));
    }
    if (selectedCard?.id === id) {
      setSelectedCard((prev) => prev ? { ...prev, is_starred: !prev.is_starred } : null);
    }
    // Fire server action in background
    void (async () => {
      try {
        const updated = await toggleCardStarred(id);
        const mapFn = (c: CardWithRelations) => c.id === id ? { ...c, is_starred: updated.is_starred } : c;
        setCards((prev) => prev.map(mapFn));
        if (updated.is_starred) {
          setStarredCards((prev) => {
            const exists = prev.find((c) => c.id === id);
            if (exists) return prev.map(mapFn);
            return [updated, ...prev];
          });
        } else {
          setStarredCards((prev) => prev.filter((c) => c.id !== id));
        }
        if (selectedCard?.id === id) {
          setSelectedCard((prev) => prev ? { ...prev, is_starred: updated.is_starred } : null);
        }
      } catch {}
    })();
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.type !== 'task' || !c.subtasks) return c;
        const exists = c.subtasks.find((s) => s.id === subtaskId);
        if (!exists) return c;
        const updatedSubtasks = c.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s
        );
        const updatedCard = { ...c, subtasks: updatedSubtasks };
        if (selectedCard?.id === c.id) {
          setSelectedCard(updatedCard);
        }
        return updatedCard;
      })
    );
    startTransition(async () => {
      try {
        await toggleSubtaskCompleted(subtaskId);
      } catch {}
    });
  };

  const handleAddSticker = (type: StickerType) => {
    startTransition(async () => {
      try {
        const newSticker = await addSticker({
          board_id: board.id,
          sticker_type: type,
          position_x: 180 + Math.random() * 250,
          position_y: 180 + Math.random() * 200,
          rotation: (Math.random() * 20) - 10,
          scale: 1,
          z_index: 10,
        });
        setStickers((prev) => [...prev, newSticker]);
      } catch (err) {
        console.error('Failed to add sticker:', err);
      }
    });
  };

  const handleDeleteSticker = (id: string) => {
    startTransition(async () => {
      try { await deleteSticker(id); } catch {}
    });
  };

  const handlePinCard = (id: string) => {
    const rx = 100 + Math.random() * 300;
    const ry = 100 + Math.random() * 250;
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, position_x: rx, position_y: ry } : c)),
    );
    void (async () => {
      try {
        await updateCardPosition(id, { position_x: rx, position_y: ry });
      } catch {
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, position_x: 0, position_y: 0 } : c)),
        );
      }
    })();
  };

  const handleUnpinCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, position_x: 0, position_y: 0 } : c)),
    );
    void (async () => {
      try {
        await updateCardPosition(id, { position_x: 0, position_y: 0 });
      } catch {
        router.refresh();
      }
    })();
  };

  const handleThemeChange = (theme: BoardTheme) => {
    setCurrentTheme(theme);
    router.refresh();
  };

  const activePreset = SIZE_PRESETS.find((p) => p.value === boardSize) || SIZE_PRESETS[2];

  return (
    <div className="relative min-h-screen wall-backdrop pb-16 transition-colors duration-300">
      
      {/* ── Top Sleek Toolbar ────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-3">
          {backLink && (
            <Link
              href={backLink}
              id="back-to-boards"
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white text-xs font-semibold font-sans transition-colors duration-200 group mr-2"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span>Boards</span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 animate-[wiggle_4s_ease-in-out_infinite] shrink-0" />
            
            {boards && boards.length > 0 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBoardDropdownOpen((v) => !v)}
                  className="font-display font-bold text-stone-855 dark:text-white/80 leading-none flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer text-sm sm:text-base"
                >
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">{board.title}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 shrink-0 ${boardDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {boardDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBoardDropdownOpen(false)} />
                    <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-[#1f2026] border border-stone-200 dark:border-[#383a45] rounded-xl shadow-glass p-2 min-w-[200px] animate-slide-up">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2 pb-1.5 font-sans">Switch Vision Board</p>
                      {boards.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setBoardDropdownOpen(false);
                            router.push(backLink ? `/collections/${b.id}` : `/dashboard?boardId=${b.id}`);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-xs font-sans font-semibold text-stone-700 dark:text-stone-300 text-left cursor-pointer"
                        >
                          <span className="truncate pr-2">{b.title}</span>
                          {b.id === board.id && (
                            <Check size={12} className="text-amber-600 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <h2 className="font-display font-bold text-stone-850 dark:text-white/80 leading-none text-sm sm:text-base">
                {board.title}
              </h2>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Unpinned Tray button */}
          {isEditMode && unpinnedCards.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDrawerOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-300 hover:opacity-90 transition-all text-xs font-sans font-semibold animate-pulse"
            >
              <FolderOpen size={13} />
              <span>Unpinned ({unpinnedCards.length})</span>
            </button>
          )}

          {/* Email Board Snapshot */}
          <SendEmailButton boardId={board.id} />

          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => {
              const nextMode = !isEditMode;
              setIsEditMode(nextMode);
              // Close drawer when exiting edit mode; never auto-open on enter
              if (!nextMode) setIsDrawerOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans font-semibold transition-all duration-200 ${
              isEditMode
                ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                : 'bg-white/85 dark:bg-[#1f2026]/85 hover:bg-white dark:hover:bg-[#1f2026] text-stone-700 dark:text-white/80 border-stone-200/80 dark:border-[#383a45]'
            }`}
          >
            <Eye size={13} className={isEditMode ? 'inline' : 'hidden'} />
            <Edit3 size={13} className={isEditMode ? 'hidden' : 'inline'} />
            <span>{isEditMode ? 'Editing' : 'Edit'}</span>
          </button>

          {/* Board Size Toggle Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSizeMenuOpen((v) => !v)}
              title="Board canvas size"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/85 dark:bg-[#1f2026]/85 hover:bg-white dark:hover:bg-[#1f2026] border border-stone-200/80 dark:border-[#383a45] text-stone-700 dark:text-white/80 transition-all text-xs font-sans font-medium"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline capitalize">{boardSize}</span>
            </button>

            {sizeMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSizeMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-[#1f2026] border border-stone-200 dark:border-[#383a45] rounded-xl shadow-glass p-2 min-w-[170px] animate-slide-up">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 px-2 pb-1.5 font-sans">Canvas Dimensions</p>
                  {SIZE_PRESETS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSizeChange(value)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-xs font-sans font-medium text-stone-750 dark:text-stone-300"
                    >
                      <span className="flex-1 text-left">{label}</span>
                      {boardSize === value && (
                        <Check size={12} className="text-amber-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme switcher — solid bg so it's legible over any board backdrop */}
          <div className="bg-stone-900/85 rounded-lg border border-white/12 backdrop-blur-sm">
            <ThemeSwitcher
              boardId={board.id}
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
            />
          </div>
        </div>
      </div>

      {/* ── Featured Boards Strip ── */}
      {starredBoards && starredBoards.length > 0 && !backLink && (
        <section className="max-w-6xl mx-auto px-6 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
            <h3 className="text-[10px] font-bold text-stone-700/80 dark:text-white/60 font-sans tracking-widest uppercase">
              Featured boards
            </h3>
          </div>
          <FeaturedBoardsStrip boards={starredBoards} />
        </section>
      )}

      {/* ── Distinct Wooden Framed Board Container ─────────────────────── */}
      <div className={`relative mx-auto ${activePreset.widthClass} px-4 mt-6 transition-all duration-300`}>
        {/* Leather Hanging Straps */}
        <div className="absolute top-0 left-20 w-5.5 h-11 bg-amber-950/70 border border-amber-900/35 rounded-t-lg -translate-y-7.5 shadow z-10 hidden md:block">
          <div className="w-2.5 h-2.5 bg-yellow-600 border border-yellow-700 rounded-full mx-auto mt-2 shadow-inner" />
        </div>
        <div className="absolute top-0 right-20 w-5.5 h-11 bg-amber-950/70 border border-amber-900/35 rounded-t-lg -translate-y-7.5 shadow z-10 hidden md:block">
          <div className="w-2.5 h-2.5 bg-yellow-600 border border-yellow-700 rounded-full mx-auto mt-2 shadow-inner" />
        </div>

        {/* Board Frame container wrapper */}
        <div className="board-frame overflow-hidden">
          <BoardCanvas
            board={{ ...board, theme: currentTheme }}
            initialCards={pinnedCards}
            initialStickers={stickers}
            onEditCard={handleCardClick}
            onToggleCompleted={handleToggleCompleted}
            onToggleStarred={handleToggleStarred}
            onDeleteSticker={handleDeleteSticker}
            isEditMode={isEditMode}
            onUnpinCard={handleUnpinCard}
            className="transition-all duration-300"
            style={{ minHeight: activePreset.height }}
          />
        </div>
      </div>

      {/* ── Starred Featured Gallery (Moved Below the Board container) ── */}
      <section className="max-w-6xl mx-auto px-6 mt-12">
        <div className="flex items-center gap-2 mb-3.5">
          <Star size={13} className="text-amber-500 fill-amber-500" />
          <h3 className="text-xs font-bold text-stone-700/80 dark:text-white/60 font-sans tracking-widest uppercase">
            Starred dreams & milestones
          </h3>
        </div>
        {/* overflow-visible + padding ensures hover lift + shadows aren't clipped */}
        <div className="overflow-visible pt-3 pb-3">
          <FeaturedStrip cards={starredCards} onCardClick={handleCardClick} />
        </div>
      </section>

      {/* ── Slide-out tray drawer for unpinned cards ─────────────────── */}
      {isDrawerOpen && isEditMode && (
        <>
          <div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" onClick={() => setIsDrawerOpen(false)} />
          <aside className="fixed top-0 right-0 h-screen w-80 bg-white/95 dark:bg-[#1a1c23]/95 backdrop-blur-md shadow-2xl border-l border-stone-200/80 dark:border-[#2b2d38] z-50 p-6 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-[#2b2d38] mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-orange-500" />
                <h3 className="font-display font-bold text-stone-900 dark:text-white">Unpinned Items</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-[#2b2d38] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400/80 mb-4 font-sans leading-relaxed">
              Items added outside the canvas (e.g. from list pages) gather here. Pin them to organize them.
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
              {unpinnedCards.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-10">
                  <Sparkles size={24} className="text-stone-400 mb-2" />
                  <span className="text-xs font-sans text-stone-500">No unpinned items</span>
                </div>
              ) : (
                unpinnedCards.map((card) => {
                  const cardColor = card.color || '#FFF3B0';
                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className="p-3.5 rounded-xl border border-stone-200/80 dark:border-[#2a2c38] shadow-sm hover:shadow transition-all flex flex-col justify-between min-h-[100px] cursor-pointer"
                      style={{ backgroundColor: card.type === 'image' || card.type === 'video' ? '#ffffff' : cardColor }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-bold font-sans uppercase tracking-wider text-stone-600/80">
                            {card.type}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinCard(card.id);
                            }}
                            className="flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-1 rounded bg-stone-900/10 text-stone-800 hover:bg-stone-900/20 transition-all shadow-sm"
                          >
                            <Pin size={8} />
                            Pin
                          </button>
                        </div>
                        <h4 className="font-display font-bold text-sm text-stone-900 leading-snug line-clamp-2">
                          {card.title || card.content || 'Untitled'}
                        </h4>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        </>
      )}

      {/* ── Quick Add Floating Menu ──────────────────────────────────── */}
      {isEditMode && (
        <QuickAddMenu
          onAddCard={handleOpenNewEditor}
          onAddSticker={handleAddSticker}
        />
      )}

      {/* ── Edit Card Dialog Modal ────────────────────────────────────── */}
      {editorOpen && (
        <CardEditorModal
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          card={selectedCard}
          cardType={addingType ?? 'goal'}
          boardId={board.id}
          onSaved={handleModalSave}
          onDeleted={handleModalDelete}
          isBoardText={addingIsBoardText || (selectedCard?.attribution === 'board_text')}
        />
      )}

      {/* ── View Card Expanded Modal ──────────────────────────────────── */}
      {viewerOpen && selectedCard && (
        <CardExpandedView
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          card={selectedCard}
          onEdit={() => {
            setViewerOpen(false);
            setAddingType(null);
            setEditorOpen(true);
          }}
          onToggleCompleted={handleToggleCompleted}
          onToggleStarred={handleToggleStarred}
          onToggleSubtask={handleToggleSubtask}
        />
      )}
    </div>
  );
}
