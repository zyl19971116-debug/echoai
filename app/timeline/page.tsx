import type { Metadata } from 'next';
import { RealRecordsView } from '@/components/records/RealRecordsView';

export const metadata: Metadata = {
  title: 'Real Wallet Timeline',
  description: 'Read chronological public transactions returned by live chain indexers.',
};

export default function TimelinePage() {
  return <RealRecordsView mode="timeline" />;
}
