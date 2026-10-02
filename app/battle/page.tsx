import type { Metadata } from 'next';
import { RealRecordsView } from '@/components/records/RealRecordsView';

export const metadata: Metadata = {
  title: 'Real Wallet Records',
  description: 'Compare public transaction records without generated battle results.',
};

export default function BattlePage() {
  return <RealRecordsView mode="battle" />;
}
