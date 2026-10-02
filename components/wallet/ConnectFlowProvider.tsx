'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { ConnectFlowContext } from '@/hooks/useConnectFlow';
import { WalletModal } from './WalletModal';
import { ShadowLoader } from '@/components/shadow/ShadowLoader';
import type { WalletKind } from '@/types';

/**
 * Owns the whole "connect → build Shadow → open My Echo" journey so any
 * surface (header, hero, feature cards, battle page) can trigger it with one
 * call and get identical behaviour.
 */
export function ConnectFlowProvider({ children }: { children: ReactNode }) {
  const { address, status, connect, error, clearError, installedKinds } = useWallet();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingKind, setPendingKind] = useState<WalletKind | null>(null);
  const [creating, setCreating] = useState(false);

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
        setCreating(true);
      } else {
        setModalOpen(true);
      }
    },
    [connect],
  );  const open = useCallback(
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

  const value = useMemo(() => ({ open, busy: creating || status === 'connecting' }), [open, creating, status]);

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

      <AnimatePresence>
        {creating && (
          <ShadowLoader
            address={address}
            onComplete={() => {
              setCreating(false);
              router.push('/my-echo');
            }}
          />
        )}
      </AnimatePresence>
    </ConnectFlowContext.Provider>
  );
}
