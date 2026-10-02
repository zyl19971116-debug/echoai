'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { ConnectFlowContext } from '@/hooks/useConnectFlow';
import { WalletModal } from './WalletModal';
import type { WalletKind } from '@/types';

/**
 * Owns the whole "connect → build Shadow → open My Echo" journey so any
 * surface (header, hero, feature cards, battle page) can trigger it with one
 * call and get identical behaviour.
 */
export function ConnectFlowProvider({ children }: { children: ReactNode }) {
  const { status, connect, error, clearError, installedKinds } = useWallet();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingKind, setPendingKind] = useState<WalletKind | null>(null);

  useEffect(() => {
    if (status === 'error' && error) {
      setModalOpen(true);
      setPendingKind(null);
    }
  }, [status, error]);

  const runConnect = useCallback(
    async (kind: WalletKind) => {
      setPendingKind(kind);
      const ok = await connect(kind);
      setPendingKind(null);

      if (ok) {
        setModalOpen(false);
        router.push('/my-echo');
      } else {
        setModalOpen(true);
      }
    },
    [connect, router],
  );

  const open = useCallback(
    (kind?: WalletKind) => {
      clearError();
      if (kind) {
        void runConnect(kind);
        return;
      }
      setModalOpen(true);
    },
    [clearError, runConnect],
  );

  const value = useMemo(() => ({ open, busy: status === 'connecting' }), [open, status]);

  return (
    <ConnectFlowContext.Provider value={value}>
      {children}

      <WalletModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          clearError();
        }}
        onSelect={(kind) => void runConnect(kind)}
        pendingKind={pendingKind}
        errorMessage={error?.message ?? null}
        installedKinds={installedKinds}
      />
    </ConnectFlowContext.Provider>
  );
}
