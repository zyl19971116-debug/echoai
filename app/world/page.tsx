import type { Metadata } from 'next';
import { WorldView } from '@/components/world/WorldView';

export const metadata: Metadata = {
  title: 'The Echo World',
  description:
    'Humans vs AI — the global aggregate of every wallet forked into an AI Shadow, with the full shadow leaderboard.',
};

export default function WorldPage() {
  return <WorldView />;
}
