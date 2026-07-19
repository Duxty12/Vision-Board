import type { Metadata } from 'next';
import { getUserBoards } from '@/lib/actions/boards';
import { BoardGrid } from '@/components/collections/BoardGrid';

export const metadata: Metadata = {
  title: 'Vision Boards',
};

export default async function CollectionsPage() {
  const boards = await getUserBoards().catch(() => []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BoardGrid initialBoards={boards} />
    </div>
  );
}
