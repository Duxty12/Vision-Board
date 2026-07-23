'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { ZoomIn, ZoomOut, Pin } from 'lucide-react';
import type { CardWithRelations, Sticker, Board, BoardTheme } from '@/lib/types';
import { updateCardPosition, updateCardDimensions } from '@/lib/actions/cards';
import { updateSticker } from '@/lib/actions/stickers';
import { CardCompactView } from '@/components/cards/CardCompactView';
import { StickerLayer } from '@/components/board/StickerLayer';

interface DraggableCardProps {
  card: CardWithRelations;
  isEditMode: boolean;
  onClickCard: (card: CardWithRelations) => void;
  onToggleCompleted?: (id: string) => void;
  onToggleStarred?: (id: string) => void;
  onUnpinCard?: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onResize?: (id: string, newWidth: number) => void;
  isDragging?: boolean;
}

function DraggableCard({
  card,
  isEditMode,
  onClickCard,
  onToggleCompleted,
  onToggleStarred,
  onUnpinCard,
  onBringToFront,
  onResize,
  isDragging,
}: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `card-${card.id}`,
    data: { type: 'card', card },
    disabled: !isEditMode,
  });

  const [cardWidth, setCardWidth] = useState(card.width || 220);

  // Sync state with prop if width changes elsewhere
  React.useEffect(() => {
    setCardWidth(card.width || 220);
  }, [card.width]);

  const baseWidth = cardWidth;
  const actualWidth = card.type === 'video' ? baseWidth * 2 : baseWidth;

  const handleResize = useCallback((delta: number) => {
    const minWidth = 140;
    const maxWidth = 480;
    const newWidth = Math.min(maxWidth, Math.max(minWidth, cardWidth + delta));
    setCardWidth(newWidth);
    onResize?.(card.id, newWidth);
  }, [card.id, cardWidth, onResize]);

  const handleMouseDown = () => {
    if (isEditMode) {
      onBringToFront?.(card.id);
    }
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: card.position_x,
    top: card.position_y,
    width: actualWidth,
    zIndex: isDragging ? 9999 : (card.z_index || 1),
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    touchAction: 'none',
    opacity: isDragging ? 0.35 : 1,
    transition: isDragging ? 'none' : 'opacity 0.1s',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Do not open details if clicking close buttons, star buttons, checkbox, delete icons, or media controls
    if ((e.target as HTMLElement).closest('button, [data-control="true"]')) {
      return;
    }
    // Image/video cards are self-contained — no editor modal
    if (card.type === 'image' || card.type === 'video') {
      return;
    }
    e.stopPropagation();
    onClickCard(card);
  };

  const dragProps = isEditMode ? { ...attributes, ...listeners } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleCardClick}
      onMouseDown={handleMouseDown}
      className={`group/card relative rounded-sticky ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      {...dragProps}
    >
      {/* Unpin red pushpin button */}
      {isEditMode && onUnpinCard && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUnpinCard(card.id);
          }}
          className="absolute -top-2.5 -right-2.5 z-30 p-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-[#383a45] rounded-full shadow-pin hover:scale-115 text-rose-500 transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover/card:opacity-100"
          title="Unpin from canvas"
          data-control="true"
        >
          <Pin size={10} className="rotate-45 fill-rose-500" />
        </button>
      )}

      {/* Resize Controls */}
      {isEditMode && (
        <div className="absolute -bottom-2 -right-2 z-30 flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity sm:opacity-0" data-control="true">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleResize(-20); }}
            className="p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-[#383a45] rounded-full shadow text-stone-500 hover:text-rose-500 hover:scale-110 transition-all cursor-pointer"
            title="Make smaller"
            data-control="true"
          >
            <ZoomOut size={9} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleResize(20); }}
            className="p-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-[#383a45] rounded-full shadow text-stone-500 hover:text-emerald-500 hover:scale-110 transition-all cursor-pointer"
            title="Make larger"
            data-control="true"
          >
            <ZoomIn size={9} />
          </button>
        </div>
      )}

      {/* Card Visual content */}
      <CardCompactView
        card={card}
        isEditMode={isEditMode}
        onToggleCompleted={onToggleCompleted}
        onToggleStarred={onToggleStarred}
      />
    </div>
  );
}

export interface BoardCanvasProps {
  board: Board;
  initialCards: CardWithRelations[];
  initialStickers: Sticker[];
  isEditMode?: boolean;
  onEditCard?: (card: CardWithRelations) => void;
  onToggleCompleted?: (id: string) => void;
  onToggleStarred?: (id: string) => void;
  onDeleteSticker?: (id: string) => void;
  onUnpinCard?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function BoardCanvas({
  board,
  initialCards,
  initialStickers,
  isEditMode = false,
  onEditCard,
  onToggleCompleted,
  onToggleStarred,
  onDeleteSticker,
  onUnpinCard,
  className = '',
  style,
}: BoardCanvasProps) {
  const [cards, setCards] = useState<CardWithRelations[]>(initialCards);
  const [stickers, setStickers] = useState<Sticker[]>(initialStickers);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Smart merge: when the server re-pushes initialCards (e.g. after a revalidation),
  // preserve local positional/dimensional values to avoid reverting optimistic canvas edits.
  React.useEffect(() => {
    setCards((prev) => {
      const localById = new Map(prev.map((c) => [c.id, c]));
      return initialCards.map((serverCard) => {
        const local = localById.get(serverCard.id);
        if (!local) return serverCard;
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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleBringToFront = useCallback((id: string) => {
    let nextZIndex = 1;
    let cardToUpdate: CardWithRelations | undefined;

    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card) return prev;
      const maxCardZ = prev.reduce((max, c) => Math.max(max, c.z_index || 1), 1);
      const maxStickerZ = stickers.reduce((max, s) => Math.max(max, s.z_index || 1), 1);
      nextZIndex = Math.max(maxCardZ, maxStickerZ, 1) + 1;
      if (card.z_index === nextZIndex) return prev;
      cardToUpdate = card;
      return prev.map((c) => (c.id === id ? { ...c, z_index: nextZIndex } : c));
    });

    if (cardToUpdate) {
      void (async () => {
        try {
          await updateCardPosition(id, {
            position_x: cardToUpdate!.position_x,
            position_y: cardToUpdate!.position_y,
            z_index: nextZIndex,
          });
        } catch { }
      })();
    }
  }, [stickers]);

  const handleCardResize = useCallback((id: string, newWidth: number) => {
    let nextZIndex = 1;
    let cardToUpdate: CardWithRelations | undefined;

    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card) return prev;
      const maxCardZ = prev.reduce((max, c) => Math.max(max, c.z_index || 1), 1);
      const maxStickerZ = stickers.reduce((max, s) => Math.max(max, s.z_index || 1), 1);
      nextZIndex = Math.max(maxCardZ, maxStickerZ, 1) + 1;
      cardToUpdate = card;
      return prev.map((c) => (c.id === id ? { ...c, width: newWidth, z_index: nextZIndex } : c));
    });

    if (cardToUpdate) {
      void (async () => {
        try {
          await updateCardDimensions(id, { width: newWidth, height: cardToUpdate!.height || 0 });
          await updateCardPosition(id, {
            position_x: cardToUpdate!.position_x,
            position_y: cardToUpdate!.position_y,
            z_index: nextZIndex,
          });
        } catch { }
      })();
    }
  }, [stickers]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!isEditMode) return;
    const id = String(event.active.id);
    if (id.startsWith('card-')) {
      const cardId = id.replace('card-', '');
      setActiveCardId(cardId);
      handleBringToFront(cardId);
    }
  }, [isEditMode, handleBringToFront]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveCardId(null);
    if (!isEditMode) return;

    const { active, delta } = event;
    const id = String(active.id);
    if (id.startsWith('card-')) {
      const cardId = id.replace('card-', '');
      const card = cards.find((c) => c.id === cardId);
      if (!card) return;
      const newX = Math.max(0, card.position_x + delta.x);
      const newY = Math.max(0, card.position_y + delta.y);

      let nextZIndex = 1;
      setCards((prev) => {
        const maxCardZ = prev.reduce((max, c) => Math.max(max, c.z_index || 1), 1);
        const maxStickerZ = stickers.reduce((max, s) => Math.max(max, s.z_index || 1), 1);
        nextZIndex = Math.max(maxCardZ, maxStickerZ, 1) + 1;
        return prev.map((c) => c.id === cardId ? { ...c, position_x: newX, position_y: newY, z_index: nextZIndex } : c);
      });

      void (async () => {
        try {
          await updateCardPosition(cardId, {
            position_x: newX,
            position_y: newY,
            z_index: nextZIndex,
          });
        } catch {
          // Revert is ignored for simple client z-index flow
        }
      })();
    }
  }, [cards, stickers, isEditMode]);

  const handleStickerBringToFront = useCallback((id: string) => {
    let nextZIndex = 1;
    let stickerToUpdate: Sticker | undefined;

    setStickers((prev) => {
      const sticker = prev.find((s) => s.id === id);
      if (!sticker) return prev;
      const maxCardZ = cards.reduce((max, c) => Math.max(max, c.z_index || 1), 1);
      const maxStickerZ = prev.reduce((max, s) => Math.max(max, s.z_index || 1), 1);
      nextZIndex = Math.max(maxCardZ, maxStickerZ, 1) + 1;
      if (sticker.z_index === nextZIndex) return prev;
      stickerToUpdate = sticker;
      return prev.map((s) => (s.id === id ? { ...s, z_index: nextZIndex } : s));
    });

    if (stickerToUpdate) {
      void (async () => {
        try {
          await updateSticker(id, { z_index: nextZIndex });
        } catch { }
      })();
    }
  }, [cards]);

  const handleStickerMove = useCallback((id: string, x: number, y: number) => {
    let nextZIndex = 1;
    setStickers((prev) => {
      const maxCardZ = cards.reduce((max, c) => Math.max(max, c.z_index || 1), 1);
      const maxStickerZ = prev.reduce((max, s) => Math.max(max, s.z_index || 1), 1);
      nextZIndex = Math.max(maxCardZ, maxStickerZ, 1) + 1;
      return prev.map((s) => (s.id === id ? { ...s, position_x: x, position_y: y, z_index: nextZIndex } : s));
    });
    void (async () => {
      try {
        await updateSticker(id, { position_x: x, position_y: y, z_index: nextZIndex });
      } catch { }
    })();
  }, [cards]);

  const handleStickerRotate = useCallback((id: string, rotation: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, rotation } : s)));
    void (async () => {
      try {
        await updateSticker(id, { rotation });
      } catch { }
    })();
  }, []);

  const handleStickerScale = useCallback((id: string, scale: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, scale } : s)));
    void (async () => {
      try {
        await updateSticker(id, { scale });
      } catch { }
    })();
  }, []);

  const handleDeleteSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    onDeleteSticker?.(id);
  }, [onDeleteSticker]);

  const themeClass: Record<BoardTheme, string> = {
    cork: 'board-canvas--cork', linen: 'board-canvas--linen', white: 'board-canvas--white', dark: 'board-canvas--dark',
  };

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        id="board-canvas"
        data-theme={board.theme}
        className={`board-canvas ${themeClass[board.theme]} relative z-0 overflow-hidden isolate ${className}`}
        style={{ minHeight: '750px', isolation: 'isolate', ...style }}
      >
        {/* Stickers layer */}
        <StickerLayer
          stickers={stickers}
          isEditMode={isEditMode}
          onMove={handleStickerMove}
          onRotate={handleStickerRotate}
          onScale={handleStickerScale}
          onDelete={handleDeleteSticker}
          onBringToFront={handleStickerBringToFront}
        />

        {/* Pinned cards */}
        {cards.map((card) => (
          <DraggableCard
            key={card.id}
            card={card}
            isEditMode={isEditMode}
            onClickCard={(c) => { onEditCard?.(c); handleBringToFront(c.id); }}
            onToggleCompleted={onToggleCompleted}
            onToggleStarred={onToggleStarred}
            onUnpinCard={onUnpinCard}
            onBringToFront={handleBringToFront}
            onResize={handleCardResize}
            isDragging={activeCardId === card.id}
          />
        ))}

        {/* Empty board state */}
        {cards.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="text-center opacity-70 px-4">
              <p className="text-white/80 font-display text-xl font-semibold drop-shadow">Your board canvas is empty</p>
              {isEditMode ? (
                <p className="text-white/50 font-sans text-xs mt-1 max-w-[280px] mx-auto leading-relaxed">
                  Tap <strong className="text-white/70">+</strong> to create items or open the <strong className="text-white/70">Unpinned shelf</strong> to place cards.
                </p>
              ) : (
                <p className="text-white/50 font-sans text-xs mt-1">Enable Edit Mode to customize this board.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard && (
          <div style={{ width: activeCard.width || 220, opacity: 0.8, pointerEvents: 'none' }}>
            <CardCompactView card={activeCard} isEditMode={true} onToggleCompleted={() => { }} onToggleStarred={() => { }} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
