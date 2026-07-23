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
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <polygon points="24,4 29.5,17 44,18 32.5,27.5 37,42 24,33 11,42 15.5,27.5 4,18 18.5,17" fill="url(#starGrad)" stroke="#D97706" strokeWidth="1.5" strokeLinejoin="round" />
          <defs>
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-sm">
          <path d="M8 24 L36 24 M26 14 L38 24 L26 34" stroke="#4F46E5" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'tape':
      return (
        <svg width={Math.round(80 * scale)} height={Math.round(28 * scale)} viewBox="0 0 80 28" fill="none" className="drop-shadow-xs opacity-90">
          <rect x="0" y="4" width="80" height="20" rx="3" fill="rgba(216, 180, 254, 0.85)" />
          <rect x="0" y="4" width="80" height="20" rx="3" stroke="rgba(192, 132, 252, 0.6)" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      );
    case 'flower':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <circle cx="24" cy="11" r="7" fill="#FB7185" />
          <circle cx="24" cy="37" r="7" fill="#FB7185" />
          <circle cx="11" cy="24" r="7" fill="#FB7185" />
          <circle cx="37" cy="24" r="7" fill="#FB7185" />
          <circle cx="15" cy="15" r="6.5" fill="#FDA4AF" />
          <circle cx="33" cy="15" r="6.5" fill="#FDA4AF" />
          <circle cx="15" cy="33" r="6.5" fill="#FDA4AF" />
          <circle cx="33" cy="33" r="6.5" fill="#FDA4AF" />
          <circle cx="24" cy="24" r="8" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <path d="M24 42 C24 42 4 28 4 16 C4 10 9 5 15.5 5 C19 5 22 7 24 10 C26 7 29 5 32.5 5 C39 5 44 10 44 16 C44 28 24 42 24 42Z" fill="url(#heartGrad)" stroke="#E11D48" strokeWidth="1.5" />
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FB7185" />
              <stop offset="100%" stopColor="#E11D48" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'smile':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <circle cx="24" cy="24" r="20" fill="url(#smileGrad)" stroke="#D97706" strokeWidth="2" />
          <circle cx="17" cy="18" r="2.5" fill="#78350F" />
          <circle cx="31" cy="18" r="2.5" fill="#78350F" />
          <path d="M15 27 C19 33, 29 33, 33 27" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <defs>
            <radialGradient id="smileGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'sun':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <circle cx="24" cy="24" r="10" fill="url(#sunGrad)" stroke="#EA580C" strokeWidth="2" />
          <line x1="24" y1="4"  x2="24" y2="10" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="24" y1="38" x2="24" y2="44" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="4"  y1="24" x2="10" y2="24" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="24" x2="44" y2="24" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="10" y1="10" x2="14.5" y2="14.5" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="10" x2="33.5" y2="14.5" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="10" y1="38" x2="14.5" y2="33.5" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="38" x2="33.5" y2="33.5" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          <defs>
            <radialGradient id="sunGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="100%" stopColor="#F97316" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'pin':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-lg">
          {/* Metallic Pin Needle */}
          <path d="M22 24 L14 42 L25 25 Z" fill="#94A3B8" />
          <path d="M22 24 L14 42" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 24 L14 42" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />

          {/* Base Rim Shadow */}
          <ellipse cx="26" cy="22" rx="9" ry="3.5" fill="rgba(0,0,0,0.25)" />

          {/* Pin Body Lower Rim */}
          <path d="M17 19 C17 22.5, 33 22.5, 33 19 L30 15 C30 15, 19 15, 19 15 Z" fill="url(#pinBodyGrad)" />
          
          {/* Pushpin Glossy Spherical Head */}
          <circle cx="25" cy="12" r="10" fill="url(#pinHeadGrad)" />
          {/* Highlight Specular Arc */}
          <ellipse cx="22" cy="8.5" rx="3.5" ry="2" fill="rgba(255,255,255,0.75)" transform="rotate(-25 22 8.5)" />

          <defs>
            <radialGradient id="pinHeadGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="45%" stopColor="#EE2B2B" />
              <stop offset="100%" stopColor="#880000" />
            </radialGradient>
            <linearGradient id="pinBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'sparkle':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          {/* Main 4-point star sparkle */}
          <path
            d="M24 2 C24 14, 24 14, 36 24 C24 34, 24 34, 24 46 C24 34, 24 34, 12 24 C24 14, 24 14, 24 2 Z"
            fill="url(#sparkleGrad1)"
            stroke="#D97706"
            strokeWidth="1.2"
          />
          {/* Inner core glow */}
          <path
            d="M24 8 C24 16, 24 16, 31 24 C24 31, 24 31, 24 40 C24 31, 24 31, 17 24 C24 16, 24 16, 24 8 Z"
            fill="#FFF"
            opacity="0.8"
          />
          {/* Companion small sparkle */}
          <path
            d="M38 5 C38 9, 38 9, 42 13 C38 17, 38 17, 38 21 C38 17, 38 17, 34 13 C38 9, 38 9, 38 5 Z"
            fill="url(#sparkleGrad2)"
          />
          {/* Sparkle star dust dots */}
          <circle cx="9" cy="35" r="2.5" fill="#FBBF24" />
          <circle cx="37" cy="37" r="1.5" fill="#FDE68A" />

          <defs>
            <linearGradient id="sparkleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF5C0" />
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="sparkleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'cloud':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="drop-shadow-md">
          <path d="M12 32 C12 32, 8 28, 10 22 C12 16, 18 16, 20 18 C22 12, 30 12, 34 16 C38 18, 40 24, 38 28 C40 30, 38 36, 32 36 L14 36 C8 36, 8 32, 12 32 Z" fill="url(#cloudGrad)" stroke="#0284C7" strokeWidth="1.5" />
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </linearGradient>
          </defs>
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

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isEditMode) return;
    if ((e.target as HTMLElement).closest('[data-control]')) return;
    onBringToFront?.(sticker.id);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    dragStart.current = { mouseX: clientX, mouseY: clientY, posX: sticker.position_x, posY: sticker.position_y, hasMoved: false };

    const onMoveEvent = (ev: MouseEvent | TouchEvent) => {
      if (!dragStart.current) return;
      const curX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const curY = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const dx = curX - dragStart.current.mouseX;
      const dy = curY - dragStart.current.mouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStart.current.hasMoved = true;
        setIsSelected(true);
      }
      onMove(sticker.id, Math.max(0, dragStart.current.posX + dx), Math.max(0, dragStart.current.posY + dy));
    };
    const onEndEvent = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMoveEvent);
      window.removeEventListener('mouseup', onEndEvent);
      window.removeEventListener('touchmove', onMoveEvent);
      window.removeEventListener('touchend', onEndEvent);
    };
    window.addEventListener('mousemove', onMoveEvent);
    window.addEventListener('mouseup', onEndEvent);
    window.addEventListener('touchmove', onMoveEvent, { passive: false });
    window.addEventListener('touchend', onEndEvent);
  }, [sticker, onMove, isEditMode, onBringToFront]);

  const handleRotate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBringToFront?.(sticker.id);
    onRotate(sticker.id, (sticker.rotation + 15) % 360);
  }, [sticker, onRotate, onBringToFront]);

  const handleScaleUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBringToFront?.(sticker.id);
    onScale(sticker.id, Math.min(sticker.scale + 0.25, 4));
  }, [sticker, onScale, onBringToFront]);

  const handleScaleDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBringToFront?.(sticker.id);
    onScale(sticker.id, Math.max(sticker.scale - 0.25, 0.5));
  }, [sticker, onScale, onBringToFront]);

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
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
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
        touchAction: isEditMode ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
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
          className="absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-full px-2 py-1 shadow-card animate-fade-in"
          data-control="true"
        >
          <button data-control="true" onClick={handleScaleDown} title="Shrink" className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <ZoomOut size={12} className="text-stone-600 dark:text-stone-300" />
          </button>
          <button data-control="true" onClick={handleScaleUp} title="Grow" className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <ZoomIn size={12} className="text-stone-600 dark:text-stone-300" />
          </button>
          <button data-control="true" onClick={handleRotate} title="Rotate 15deg" className="w-6 h-6 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <RotateCw size={12} className="text-stone-600 dark:text-stone-300" />
          </button>
          <div className="w-px h-4 bg-stone-200 dark:bg-stone-700 mx-0.5" />
          <button data-control="true" onClick={handleDelete} title="Delete sticker" className="w-6 h-6 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors">
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
    <div className="absolute inset-0 pointer-events-none">
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
