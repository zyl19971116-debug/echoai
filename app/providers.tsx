'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { WalletProvider } from '@/hooks/useWallet';
import { ConnectFlowProvider } from '@/components/wallet/ConnectFlowProvider';

/**
 * Client-side providers. Kept in one place so `app/layout.tsx` can stay a
 * server component and still export metadata.
 *
 *   Toast  →  Wallet  →  ConnectFlow
 *
 * ConnectFlow depends on both, so the order matters.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <WalletProvider>
        <ConnectFlowProvider>{children}</ConnectFlowProvider>
      </WalletProvider>
    </ToastProvider>
  );
}
