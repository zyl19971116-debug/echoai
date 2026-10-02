import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GridBackdrop } from '@/components/ui/Backdrop';

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'ECHO AI² — What if your wallet had another life?',
    template: '%s · ECHO AI²',
  },
  description:
    'ECHO AI² reads real public on-chain wallet history through supported live indexers without generating demo records.',
  keywords: [
    'ECHO AI²',
    'AI Shadow',
    'Web3 AI',
    'on-chain analytics',
    'wallet analysis',
    'human vs AI',
    'public chain records',
  ],
  openGraph: {
    title: 'ECHO AI² — What if your wallet had another life?',
    description:
      'Connect a wallet. Meet the AI version of it. Same start, different choices. Who will do better?',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#03060B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void-900 font-sans text-echo-text antialiased">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <GridBackdrop />
        </div>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
