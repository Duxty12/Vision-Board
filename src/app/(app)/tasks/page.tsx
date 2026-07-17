import type { Metadata } from 'next';
import { getCards } from '@/lib/actions/cards';
import { TasksPageClient } from './TasksPageClient';

export const metadata: Metadata = {
  title: 'Tasks',
};

// Force dynamic rendering since we read Clerk session state and cookies
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const cards = await getCards({ type: 'task' });

  return <TasksPageClient initialCards={cards} />;
}
