'use client';

import React, { useCallback, useRef, useState } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import type { Sticker, StickerType } from '@/lib/types';

// ─── SVG Sticker shapes ───────────────────────────────────────────────────────

function StickerShape({ type, scale }: { type: StickerType; scale: number }) {
  const size = Math.round(48 * scale);
  switch (type) {
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 29,18 44,18 32,27 37,42 24,33 11,42 16,27 4,18 19,18" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );
    case 'arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M8 24 L36 24 M28 14 L38 24 L28 34" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'tape':
      return (
        <svg width={Math.round(80 * scale)} height={Math.round(28 * scale)} viewBox="0 0 80 28" fill="none">
          <rect x="0" y="4" width="80" height="20" rx="4" fill="rgba(196,181,253,0.7)" />
          <rect x="0" y="4" width="80" height="20" rx="4" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        </svg>
      );
    case 'flower':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="10" r="7" fill="#FDA4AF" />
          <circle cx="24" cy="38" r="7" fill="#FDA4AF" />
          <circle cx="10" cy="24" r="7" fill="#FDA4AF" />
          <circle cx="38" cy="24" r="7" fill="#FDA4AF" />
          <circle cx="14" cy="14" r="6" fill="#FCA5A5" />
          <circle cx="34" cy="14" r="6" fill="#FCA5A5" />
          <circle cx="14" cy="34" r="6" fill="#FCA5A5" />
          <circle cx="34" cy="34" r="6" fill="#FCA5A5" />
          <circle cx="24" cy="24" r="8" fill="#FDE68A" />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M24 42 C24 42 4 28 4 16 C4 10 9 5 15.5 5 C19 5 22 7 24 10 C26 7 29 5 32.5 5 C39 5 44 10 44 16 C44 28 24 42 24 42Z" fill="#FB7185" stroke="#F43F5E" strokeWidth="1.5" />
        </svg>
      );
    case 'smile':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
          <circle cx="17" cy="18" r="2.5" fill="#B45309" />
          <circle cx="31" cy="18" r="2.5" fill="#B45309" />
          <path d="M16 28 C20 33, 28 33, 32 28" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'sun':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="10" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
          {/* cardinal rays */}
          <line x1="24" y1="4"  x2="24" y2="10" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="38" x2="24" y2="44" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4"  y1="24" x2="10" y2="24" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="24" x2="44" y2="24" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          {/* diagonal rays at true 45° */}
          <line x1="11.5" y1="11.5" x2="15.7" y2="15.7" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36.5" y1="11.5" x2="32.3" y2="15.7" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="11.5" y1="36.5" x2="15.7" y2="32.3" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36.5" y1="36.5" x2="32.3" y2="32.3" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'pin':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ transform: 'rotate(30deg)' }}>
          <path d="M20 12 L28 12 M24 12 L24 28 M16 28 L32 28 M24 28 L24 44" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          <circle cx="24" cy="10" r="6" fill="#EF4444" />
        </svg>
      );
    case 'sparkle':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M24 4 C24 16, 24 16, 36 24 C24 32, 24 32, 24 44 C24 32, 24 32, 12 24 C24 16, 24 16, 24 4 Z" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );
    case 'cloud':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 32 C12 32, 8 28, 10 22 C12 16, 18 16, 20 18 C22 12, 30 12, 34 16 C38 18, 40 24, 38 28 C40 30, 38 36, 32 36 L14 36 C8 36, 8 32, 12 32 Z" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

// ─── Single sticker (draggable, rotatable, scalable) ─────────────────────────

interface StickerItemProps {
  sticker: Sticker;
  isEditMode: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onScale: (id: string, scale: number) => void;
  onDelete: (id: string) => void;
  onBringToFront?: (id: string) => void;
}

function StickerItem({ sticker, isEditMode, onMove, onRotate, onScale, onDelete, onBringToFront }: StickerItemProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number; hasMoved: boolean } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    if ((e.target as HTMLElement).closest('[data-control]')) return;
    e.preventDefault();
    e.stopPropagation();
    onBringToFront?.(sticker.id);
    setIsDragging(true);
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: sticker.position_x, posY: sticker.position_y, hasMoved: false };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = ev.clientX - dragStart.current.mouseX;
      const dy = ev.clientY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStart.current.hasMoved = true;
        setIsSelected(true);
      }
      onMove(sticker.id, dragStart.current.posX + dx, dragStart.current.posY + dy);
    };
    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [sticker, onMove, isEditMode, onBringToFront]);

  const handleRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRotate(sticker.id, (sticker.rotation + 15) % 360);
  }, [sticker, onRotate]);

  const handleScaleUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onScale(sticker.id, Math.min(sticker.scale + 0.25, 4));
  }, [sticker, onScale]);

  const handleScaleDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onScale(sticker.id, Math.max(sticker.scale - 0.25, 0.5));
  }, [sticker, onScale]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(sticker.id);
  }, [sticker.id, onDelete]);

  // Clean state when exiting edit mode
  React.useEffect(() => {
    if (!isEditMode) {
      setIsSelected(false);
      setIsDragging(false);
    }
  }, [isEditMode]);

  // Close sticker menu on click outside
  React.useEffect(() => {
    if (!isSelected) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSelected]);

  return (
    <div
      ref={ref}
      className={`absolute select-none group/sticker ${isEditMode ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'pointer-events-none'}`}
      style={{
        left: sticker.position_x,
        top: sticker.position_y,
        zIndex: sticker.z_index || 5,
        transform: `rotate(${sticker.rotation}deg)`,
        transition: isDragging ? 'none' : 'filter 0.15s',
        filter: isSelected && isEditMode ? 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' : 'none',
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onBringToFront?.(sticker.id);
        if (dragStart.current?.hasMoved) {
          return;
        }
        setIsSelected((v) => !v);
      }}
    >
      <StickerShape type={sticker.sticker_type} scale={sticker.scale} />

      {/* Controls (shown when selected in edit mode) */}
      {isSelected && isEditMode && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full px-2 py-1 shadow-card animate-fade-in"
          data-control="true"
        >
          <button data-control="true" onClick={handleScaleDown} title="Shrink" className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 rounded-full transition-colors">
            <ZoomOut size={12} className="text-stone-600" />
          </button>
          <button data-control="true" onClick={handleScaleUp} title="Grow" className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 rounded-full transition-colors">
            <ZoomIn size={12} className="text-stone-600" />
          </button>
          <button data-control="true" onClick={handleRotate} title="Rotate 15deg" className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 rounded-full transition-colors">
            <RotateCw size={12} className="text-stone-600" />
          </button>
          <div className="w-px h-4 bg-stone-200 mx-0.5" />
          <button data-control="true" onClick={handleDelete} title="Delete sticker" className="w-6 h-6 flex items-center justify-center hover:bg-rose-50 rounded-full transition-colors">
            <X size={12} className="text-rose-500" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── StickerLayer ─────────────────────────────────────────────────────────────

interface StickerLayerProps {
  stickers: Sticker[];
  isEditMode?: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  onScale: (id: string, scale: number) => void;
  onDelete: (id: string) => void;
  onBringToFront?: (id: string) => void;
}

export function StickerLayer({ stickers, isEditMode = false, onMove, onRotate, onScale, onDelete, onBringToFront }: StickerLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
      {stickers.map((sticker) => (
        <div key={sticker.id} style={{ pointerEvents: isEditMode ? 'auto' : 'none' }}>
          <StickerItem
            sticker={sticker}
            isEditMode={isEditMode}
            onMove={onMove}
            onRotate={onRotate}
            onScale={onScale}
            onDelete={onDelete}
            onBringToFront={onBringToFront}
          />
        </div>
      ))}
    </div>
  );
}
