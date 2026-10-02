import type { Metadata } from 'next';
import { MyEchoView } from '@/components/echo/MyEchoView';

export const metadata: Metadata = {
  title: 'My Wallet Records',
  description: 'Read indexed public wallet statistics and real multi-chain transaction records.',
};

export default function MyEchoPage() {
  return <MyEchoView />;
}
