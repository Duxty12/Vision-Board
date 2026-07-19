import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBoard, getUserBoards } from '@/lib/actions/boards';
import { getBoardCards, getCards } from '@/lib/actions/cards';
import { getBoardStickers } from '@/lib/actions/stickers';
import { DashboardClient } from '@/app/(app)/dashboard/DashboardClient';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const board = await getBoard(params.id);
    return {
      title: `${board.title} - Canvas`,
    };
  } catch {
    return {
      title: 'Vision Board Canvas',
    };
  }
}

export default async function BoardCanvasPage({ params }: PageProps) {
  try {
    const board = await getBoard(params.id);
    if (!board) notFound();

    const [boardCards, stickers, starredCards, boards, allUserCards] = await Promise.all([
      getBoardCards(board.id).catch(() => []),
      getBoardStickers(board.id).catch(() => []),
      getCards({ is_starred: true }).catch(() => []),
      getUserBoards().catch(() => []),
      getCards().catch(() => []),
    ]);

    return (
      <DashboardClient
        board={board}
        initialCards={boardCards}
        initialStickers={stickers}
        starredCards={starredCards}
        allUserCards={allUserCards}
        boards={boards}
        backLink="/collections"
      />
    );
  } catch (err) {
    notFound();
  }
}
