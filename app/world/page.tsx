import type { Metadata } from 'next';
import { RealRecordsView } from '@/components/records/RealRecordsView';

export const metadata: Metadata = {
  title: 'The Echo World',
  description: 'Query public wallet records from supported live chains.',
};

export default function WorldPage() {
  return <RealRecordsView mode="world" />;
}
