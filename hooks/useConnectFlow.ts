'use client';

import { createContext, useContext } from 'react';
import type { WalletKind } from '@/types';

export interface ConnectFlowValue {
  /** Opens the wallet picker. Pass a kind to skip straight to that adapter. */
  open: (kind?: WalletKind) => void;
  /** True while the Shadow generation sequence is on screen. */
  busy: boolean;
}

export const ConnectFlowContext = createContext<ConnectFlowValue | null>(null);

export function useConnectFlow(): ConnectFlowValue {
  const ctx = useContext(ConnectFlowContext);
  if (!ctx) {
    throw new Error('useConnectFlow must be used inside <ConnectFlowProvider>');
  }
  return ctx;
}
