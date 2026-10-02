import type { Metadata } from 'next';
import { TimelineView } from '@/components/timeline/TimelineView';

export const metadata: Metadata = {
  title: 'Parallel Timeline',
  description:
    'Two wallets, one beginning. Replay the same window as you and as your AI Shadow — same start, different decisions.',
};

export default function TimelinePage() {
  return <TimelineView />;
}
