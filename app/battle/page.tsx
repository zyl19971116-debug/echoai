import type { Metadata } from 'next';
import { BattleView } from '@/components/battle/BattleView';

export const metadata: Metadata = {
  title: 'Shadow Battle',
  description:
    'Any wallet. Any shadow. Paste two public addresses and watch the two AI decision models run the same window side by side.',
};

interface BattlePageProps {
  searchParams?: {
    one?: string;
    two?: string;
  };
}

export default function BattlePage({ searchParams }: BattlePageProps) {
  return <BattleView initialOne={searchParams?.one} initialTwo={searchParams?.two} />;
}
