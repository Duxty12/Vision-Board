import type { Metadata } from 'next';
import { getCards } from '@/lib/actions/cards';
import { GoalsPageClient } from './GoalsPageClient';

export const metadata: Metadata = {
  title: 'Goals',
};

// Force dynamic rendering since we read Clerk session state and cookies
export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const cards = await getCards({ type: 'goal' });

  return <GoalsPageClient initialCards={cards} />;
}
