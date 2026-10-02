import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/home/Hero';
import { FeatureCards } from '@/components/home/FeatureCards';

export const metadata: Metadata = {
  title: 'ECHO AI² — What if your wallet had another life?',
  description:
    'ECHO AI² reads a wallet’s public on-chain history and generates an AI Shadow that makes different decisions from the same starting point. Humans vs AI — a simulation experiment.',
};

export default function HomePage() {
  return (
    <PageShell wide className="overflow-hidden pb-12">
      <Hero />
      <FeatureCards />
    </PageShell>
  );
}
