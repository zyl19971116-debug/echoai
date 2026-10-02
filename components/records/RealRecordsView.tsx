'use client';

import { Database, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { TransactionExplorer } from '@/components/echo/TransactionExplorer';
import { Badge } from '@/components/ui/Badge';
import { Panel } from '@/components/ui/Panel';
import { GlowButton } from '@/components/ui/GlowButton';
import { useWallet } from '@/hooks/useWallet';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import type { TransactionChain } from '@/types';

const CHAIN_BY_ID: Partial<Record<number, TransactionChain>> = {
  1: 'eth', 10: 'optimism', 56: 'bsc', 137: 'polygon', 8453: 'base', 42161: 'arb', 4663: 'rb',
};

export function RealRecordsView({ mode }: { mode: 'timeline' | 'battle' | 'world' }) {
  const { address, network, kind } = useWallet();
  const { open } = useConnectFlow();
  const chain = kind === 'phantom' ? 'sol' : (network?.chainId ? CHAIN_BY_ID[network.chainId] ?? 'eth' : 'eth');
  const titles = {
    timeline: ['REAL WALLET TIMELINE', 'Chronological public transactions returned directly by the selected chain indexer.'],
    battle: ['REAL WALLET RECORDS', 'Virtual battles have been removed. Query public wallet histories and compare their actual records.'],
    world: ['PUBLIC CHAIN RECORDS', 'Demo global totals and fictional leaderboards have been removed. Query a real public address below.'],
  } as const;

  return (
    <PageShell>
      <div className="pb-10 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="cyan" icon={<Database className="h-3 w-3" />}>Live data only</Badge>
          <Badge tone="neutral" icon={<ShieldCheck className="h-3 w-3" />}>Public · read-only</Badge>
        </div>
        <h1 className="display mt-6 text-[2.4rem] uppercase text-white sm:text-[3.2rem]">{titles[mode][0]}</h1>
        <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-echo-muted">{titles[mode][1]}</p>
      </div>

      {mode === 'timeline' && !address ? (
        <Panel frame className="mb-12 p-8 text-center">
          <h2 className="display text-xl uppercase text-white">Connect a real wallet</h2>
          <p className="mt-3 text-sm text-echo-muted">No sample address or generated history will be shown.</p>
          <div className="mt-6 flex justify-center"><GlowButton onClick={() => open()}>Connect wallet</GlowButton></div>
        </Panel>
      ) : (
        <TransactionExplorer connectedAddress={address ?? ''} initialChain={chain} />
      )}

      {mode === 'battle' && (
        <div className="border-t border-white/[0.07] pt-12">
          <TransactionExplorer connectedAddress="" initialChain="bsc" />
        </div>
      )}
    </PageShell>
  );
}
