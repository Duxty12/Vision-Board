'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
}: ConfirmModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white/95 dark:bg-[#1a1c23]/95 border border-stone-200/50 dark:border-white/10 p-6 text-left shadow-2xl transition-all duration-300 scale-100 animate-slide-up backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-50 text-red-600 dark:bg-red-950/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'}`}>
            {isDestructive ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-stone-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 font-sans mt-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold font-sans rounded-xl border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-semibold font-sans rounded-xl text-white transition-all shadow ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200 dark:shadow-none'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
