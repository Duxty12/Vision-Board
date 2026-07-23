import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';
import { getDefaultBoard, getBoard, getUserBoards, getStarredBoards } from '@/lib/actions/boards';
import { getBoardCards, getCards } from '@/lib/actions/cards';
import { getBoardStickers } from '@/lib/actions/stickers';
import { DashboardClient } from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal vision board — pin goals, tasks, quotes, and media on your freeform canvas.',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { boardId?: string };
}) {
  const boardId = searchParams?.boardId;

  // ── Fetch active board ───────────────────────────────────────────────────
  let activeBoard = null;
  if (boardId) {
    activeBoard = await getBoard(boardId).catch(() => null);
  }
  if (!activeBoard) {
    activeBoard = await getDefaultBoard().catch(() => null);
  }

  // ── Fetch other lists ─────────────────────────────────────────────────────
  const [boards, starredBoards, allUserCards] = await Promise.all([
    getUserBoards().catch(() => []),
    getStarredBoards().catch(() => []),
    getCards().catch(() => []),       // all user cards across all boards (goals, tasks, etc.)
  ]);

  const starredCards = allUserCards.filter((card) => card.is_starred);

  const [boardCards, stickers] = activeBoard
    ? await Promise.all([
        getBoardCards(activeBoard.id).catch(() => []),
        getBoardStickers(activeBoard.id).catch(() => []),
      ])
    : [[], []];

  // ── Empty-board state (no active board at all) ───────────────────────────
  if (!activeBoard) {
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
      board={activeBoard}
      initialCards={boardCards}
      initialStickers={stickers}
      starredCards={starredCards}
      allUserCards={allUserCards}
      boards={boards}
      starredBoards={starredBoards}
    />
  );
}
