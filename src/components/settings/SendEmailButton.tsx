'use client';

import { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function SendEmailButton({ boardId }: { boardId?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSend = async () => {
    if (status === 'sending') return;
    
    setStatus('sending');
    setErrorMsg(null);

    try {
      let screenshotUrl: string | undefined;

      // ── 1. Find board-canvas element & capture screenshot if present ────────
      const canvasElement = document.getElementById('board-canvas');
      if (canvasElement) {
        try {
          // Temporarily disable transition classes/effects if needed (optional)
          const canvas = await html2canvas(canvasElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false,
            scale: 1.5, // slightly better quality
          });

          const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob(resolve, 'image/png')
          );

          if (blob) {
            // Upload screenshot to Supabase Storage via our API endpoint
            const uploadRes = await fetch('/api/email/upload-screenshot', {
              method: 'POST',
              body: blob,
            });

            if (uploadRes.ok) {
              const { url } = await uploadRes.json();
              screenshotUrl = url;
            } else {
              console.warn('[SendEmailButton] Screenshot upload failed, falling back to layout digest');
            }
          }
        } catch (captureErr) {
          console.error('[SendEmailButton] Failed to capture screenshot:', captureErr);
        }
      }

      // ── 2. Request backend to send email ────────────────────────────────────
      const res = await fetch('/api/email/send-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boardId, screenshotUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setStatus('success');
      
      // Reset back to idle after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: any) {
      console.error('[SendEmailButton]', err);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to send email');
      
      // Reset back to idle after 4 seconds
      setTimeout(() => {
        setStatus('idle');
        setErrorMsg(null);
      }, 4000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        id="email-board-btn"
        onClick={handleSend}
        disabled={status === 'sending'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-sans text-white transition-all duration-300 disabled:opacity-80 active:scale-95"
        style={{
          background:
            status === 'success'
              ? 'linear-gradient(135deg, #10b981, #059669)' // Green gradient on success
              : status === 'error'
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' // Red gradient on error
              : 'linear-gradient(135deg, #c07423, #d9902e)', // Cork orange gradient normally
          boxShadow:
            status === 'success'
              ? '0 2px 8px rgba(16,185,129,0.3)'
              : status === 'error'
              ? '0 2px 8px rgba(239,68,68,0.3)'
              : '0 2px 8px rgba(192,116,35,0.3)',
        }}
      >
        {status === 'idle' && (
          <>
            <Mail size={12} className="animate-pulse" />
            <span>Send now</span>
          </>
        )}
        {status === 'sending' && (
          <>
            <Loader2 size={12} className="animate-spin" />
            <span>Sending...</span>
          </>
        )}
        {status === 'success' && (
          <>
            <Check size={12} className="scale-110 transition-transform duration-300" />
            <span>Sent!</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={12} />
            <span>Failed</span>
          </>
        )}
      </button>
      {errorMsg && (
        <span className="text-[10px] text-red-500 font-sans mt-0.5 max-w-[180px] text-right break-words">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
