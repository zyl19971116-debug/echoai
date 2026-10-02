import type { Metadata } from 'next';
import { MyEchoView } from '@/components/echo/MyEchoView';

export const metadata: Metadata = {
  title: 'My AI Shadow',
  description:
    'Meet the AI counterpart of your wallet: archetype, decision model, on-chain personality and the profile it was forked from.',
};

export default function MyEchoPage() {
  return <MyEchoView />;
}
