'use client';

import { AlertTriangle, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import { WALLET_ADAPTERS, type WalletAdapter } from '@/hooks/useWallet';
import type { WalletKind } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { WalletLogo } from './WalletLogo';
import { cn } from '@/lib/format';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (kind: WalletKind) => void;
  pendingKind?: WalletKind | null;
  errorMessage?: string | null;
  installedKinds: WalletKind[];
}

export function WalletModal({
  open,
  onClose,
  onSelect,
  pendingKind,
  errorMessage,
  installedKinds,
}: WalletModalProps) {
  const installed = WALLET_ADAPTERS.filter((adapter) => !adapter.simulated && installedKinds.includes(adapter.kind));
  const popular = WALLET_ADAPTERS.filter((adapter) => !adapter.simulated && !installedKinds.includes(adapter.kind));
  const renderAdapter = (adapter: WalletAdapter) => {
    const pending = pendingKind === adapter.kind;
    const unavailable = !adapter.simulated && !installedKinds.includes(adapter.kind) && adapter.kind !== 'walletconnect';
    return (
      <button key={adapter.kind} type="button" onClick={() => onSelect(adapter.kind)} disabled={Boolean(pendingKind)}
        className={cn('group flex items-center gap-4 rounded-sm border px-4 py-3.5 text-left transition-all duration-300 ease-echo', adapter.simulated ? 'border-echo-violet/30 bg-echo-violet/[0.06] hover:border-echo-violet/60 hover:bg-echo-violet/[0.11]' : 'border-white/[0.08] bg-white/[0.02] hover:border-echo-blue/45 hover:bg-echo-blue/[0.05]', pendingKind && !pending && 'opacity-40')}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-[#080D18] shadow-[inset_0_0_16px_rgba(255,255,255,0.025)]"><WalletLogo kind={adapter.kind} className="h-8 w-8" /></span>
        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="text-[0.86rem] font-semibold uppercase tracking-[0.14em] text-white">{adapter.label}</span>{adapter.simulated && <Badge tone="violet" className="px-2 py-[3px] text-[0.52rem]">No extension</Badge>}</span><span className="mt-1 block text-[0.72rem] text-echo-faint">{pending ? 'Waiting for approval…' : adapter.description}</span></span>
        {unavailable && <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.14em] text-echo-faint">Not detected</span>}
      </button>
    );
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      subtitle="Step 01 — Connect"
      title="Connect a wallet"
      labelledBy="wallet-modal-title"
    >
      <div className="flex flex-col gap-2.5">
        {installed.length > 0 && <><p className="px-1 pt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-echo-cyan">Installed</p>{installed.map(renderAdapter)}</>}
        <p className="px-1 pt-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-echo-faint">Popular</p>
        {popular.map(renderAdapter)}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-sm border border-[#FF9C7A]/30 bg-[#FF9C7A]/[0.07] px-3.5 py-3"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFB49A]" />
          <p className="text-[0.74rem] leading-relaxed text-[#FFD2C2]">{errorMessage}</p>
        </div>
      )}

      {/* trust block — non-negotiable part of the connect flow */}
      <div className="mt-5 border-t border-white/[0.07] pt-4">
        <p className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-echo-muted">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-echo-cyan" />
          <span>
            ECHO AI reads <strong className="font-semibold text-white/90">public on-chain data only</strong>. We never
            request your seed phrase or private key, and connecting a wallet never gives us custody of your assets.
          </span>
        </p>
        <p className="mt-3 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
          <Wallet className="h-3 w-3" />
          No signature required · No transaction · Read-only
        </p>
        <p className="mt-3 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
          <Sparkles className="h-3 w-3" />
          Every projection on this site is simulated
        </p>
      </div>
    </Modal>
  );
}
