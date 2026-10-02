import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { Hero } from '@/components/home/Hero';

export const metadata: Metadata = {
  title: 'ECHO AI² — What if your wallet had another life?',
  description:
    'ECHO AI² reads real public on-chain wallet history through live indexers. No demo transaction data is generated.',
};

export default function HomePage() {
  return (
    <PageShell wide className="overflow-hidden pb-12">
      <Hero />
    </PageShell>
  );
}
