import type { Metadata } from 'next';
import { Star, Sparkles } from 'lucide-react';
import { getDefaultBoard } from '@/lib/actions/boards';
import { getBoardCards, getCards } from '@/lib/actions/cards';
import { getBoardStickers } from '@/lib/actions/stickers';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal vision board — pin goals, tasks, quotes, and media on your freeform canvas.',
};

export default async function DashboardPage() {
  // ── Fetch data ────────────────────────────────────────────────────────────
  const [defaultBoard, starredCards] = await Promise.all([
    getDefaultBoard().catch(() => null),
    getCards({ is_starred: true }).catch(() => []),
  ]);

  const [boardCards, stickers] = defaultBoard
    ? await Promise.all([
        getBoardCards(defaultBoard.id).catch(() => []),
        getBoardStickers(defaultBoard.id).catch(() => []),
      ])
    : [[], []];

  // ── Empty-board state (no default board at all) ───────────────────────────
  if (!defaultBoard) {
    return (
      <div className="relative min-h-[calc(100vh-60px)] board-canvas board-canvas--cork flex items-center justify-center">
        <div className="text-center glass-card p-10 rounded-2xl max-w-sm mx-auto">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4 shadow-sticky"
            style={{ background: 'linear-gradient(135deg, #d9902e, #e4a94a)' }}
          >
            <Sparkles size={28} className="text-white" />
          </div>
          <h3 className="font-display text-xl font-bold text-stone-800 mb-2">Setting up your board…</h3>
          <p className="text-stone-500 text-sm font-sans leading-relaxed">
            Your personal vision board is being created. Refresh in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      board={defaultBoard}
      initialCards={boardCards}
      initialStickers={stickers}
      starredCards={starredCards}
    />
  );
}
