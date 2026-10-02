'use client';

import { Activity, CalendarClock, Fingerprint, Loader2, ShieldCheck, Wallet } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { TransactionExplorer } from '@/components/echo/TransactionExplorer';
import { useWallet } from '@/hooks/useWallet';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import { useWalletProfile } from '@/hooks/useWalletProfile';
import { formatDate, formatNumber } from '@/lib/format';
import type { TransactionChain } from '@/types';

const CHAIN_BY_ID: Partial<Record<number, TransactionChain>> = {
  1: 'eth', 10: 'optimism', 56: 'bsc', 137: 'polygon', 8453: 'base', 42161: 'arb', 4663: 'rb',
};

export function MyEchoView() {
  const { address, network, kind } = useWallet();
  const { open } = useConnectFlow();
  const isSolana = kind === 'phantom';
  const { data, loading, error } = useWalletProfile(address ?? '', Boolean(address) && !isSolana, network?.chainId);
  const chain = isSolana ? 'sol' : (network?.chainId ? CHAIN_BY_ID[network.chainId] ?? 'eth' : 'eth');

  if (!address) {
    return <PageShell><Panel frame className="mx-auto mt-16 max-w-xl p-9 text-center"><h1 className="display text-2xl uppercase text-white">Connect your wallet</h1><p className="mt-4 text-sm text-echo-muted">Only records returned by live public-chain indexers are displayed.</p><div className="mt-7 flex justify-center"><GlowButton onClick={() => open()}>Connect wallet</GlowButton></div></Panel></PageShell>;
  }

  if (isSolana) {
    return <PageShell><div className="pb-8 pt-10"><Badge tone="cyan">Live Solana records</Badge><h1 className="display mt-5 text-[2.4rem] uppercase text-white">Wallet activity</h1></div><TransactionExplorer connectedAddress={address} initialChain="sol" /></PageShell>;
  }

  if (loading) {
    return <PageShell><div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-echo-blue" /></div></PageShell>;
  }

  if (!data?.profile || error) {
    return <PageShell><Panel frame className="mx-auto mt-16 max-w-xl p-9 text-center"><h1 className="display text-xl uppercase text-white">Live records unavailable</h1><p className="mt-4 text-sm text-echo-muted">{error ?? 'No indexed records were returned. No sample data has been substituted.'}</p></Panel><TransactionExplorer connectedAddress={address} initialChain={chain} /></PageShell>;
  }

  const profile = data.profile;
  const stats = [
    { label: 'Transactions', value: profile.transactions, icon: Activity },
    { label: 'Active days', value: profile.activeDays, icon: CalendarClock },
    { label: 'Token contracts', value: profile.protocols, icon: Fingerprint },
    { label: 'NFTs', value: profile.nftCount, icon: Wallet },
    { label: 'Observed age (days)', value: profile.walletAge, icon: CalendarClock },
    { label: 'Tx / sampled day', value: profile.tradingFrequency, icon: Activity, decimals: 2 },
  ];

  return (
    <PageShell>
      <div className="pb-10 pt-8">
        <div className="flex flex-wrap gap-3"><Badge tone="cyan" icon={<ShieldCheck className="h-3 w-3" />}>Live indexer only</Badge><Badge tone="neutral">{network?.name ?? 'Connected network'}</Badge></div>
        <h1 className="display mt-6 text-[2.5rem] uppercase text-white">Real wallet profile</h1>
        <p className="mt-4 max-w-2xl text-[0.86rem] leading-relaxed text-echo-muted">Statistics below are calculated from indexed public records. Missing values remain unavailable; no demo wallet or generated transaction history is used.</p>
      </div>

      <section className="pb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => <Panel key={stat.label} className="p-5"><stat.icon className="h-3.5 w-3.5 text-echo-blue/70" /><p className="mono mt-4 text-[1.3rem] text-white"><AnimatedNumber value={stat.value} decimals={stat.decimals ?? 0} /></p><p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-echo-faint">{stat.label}</p></Panel>)}
        </div>
        <p className="mt-5 text-[0.68rem] text-echo-faint">{formatNumber(profile.transactions)} indexed transactions · first observed {formatDate(profile.firstSeen)} · last observed {formatDate(profile.lastActive)}</p>
      </section>

      <TransactionExplorer connectedAddress={address} initialChain={chain} />
    </PageShell>
  );
}
