'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  CalendarClock,
  Fingerprint,
  GitCompareArrows,
  LineChart,
  Loader2,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { FigurePanel } from '@/components/shadow/FigurePanel';
import { AttributeBar } from '@/components/shadow/AttributeBar';
import { ShadowRadar } from '@/components/charts/ShadowRadar';
import { useWallet } from '@/hooks/useWallet';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import { describeFootprint, shortAddress } from '@/lib/walletAnalysis';
import { ARCHETYPE_META } from '@/lib/archetypes';
import { attributeList } from '@/lib/shadowEngine';
import { formatDate, formatNumber } from '@/lib/format';
import { useWalletProfile } from '@/hooks/useWalletProfile';
import { TransactionExplorer } from '@/components/echo/TransactionExplorer';
import type { TransactionChain } from '@/types';

const REVEAL = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

export function MyEchoView() {
  const { address, network, kind } = useWallet();
  const { open } = useConnectFlow();

  const activeAddress = address ?? '';
  const isSolanaWallet = kind === 'phantom';
  const { data, loading, error } = useWalletProfile(activeAddress, Boolean(address) && !isSolanaWallet, network?.chainId);
  const profile = data?.profile ?? null;
  const shadow = data?.shadowPreview ?? null;
  const chainById: Partial<Record<number, TransactionChain>> = { 1: 'eth', 10: 'optimism', 56: 'bsc', 137: 'polygon', 8453: 'base', 42161: 'arb', 4663: 'rb' };
  const connectedChain = network?.chainId ? chainById[network.chainId] ?? 'eth' : 'eth';

  if (!address) {
    return (
      <PageShell>
        <EmptyState
          title="Connect your wallet"
          body="Connect a wallet to read its real public on-chain history. No demo profile or sample wallet is used."
          actionLabel="Connect wallet"
          onAction={() => open()}
        />
      </PageShell>
    );
  }

  if (isSolanaWallet && address) {
    return (
      <PageShell>
        <div className="pb-8 pt-10">
          <Badge tone="violet" icon={<Wallet className="h-3 w-3" />}>Phantom connected</Badge>
          <h1 className="display mt-5 text-[2.4rem] uppercase text-white">Solana wallet activity</h1>
          <p className="mt-3 max-w-2xl text-[0.86rem] leading-relaxed text-echo-muted">Your public Solana address is connected in read-only mode. Browse its paginated history below; no signature or transaction is requested.</p>
        </div>
        <TransactionExplorer connectedAddress={address} initialChain="sol" />
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-echo-violet" />
            <p className="kicker mt-4">Reading public on-chain history</p>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ---------------- invalid address ---------------- */
  if (!profile || error) {
    return (
      <PageShell>
        <EmptyState
          title="That address cannot be analysed"
          body={error ?? 'The connected address could not be analysed. Reconnect the wallet and try again.'}
          actionLabel="Reconnect wallet"
          onAction={() => open()}
        />
      </PageShell>
    );
  }

  /* ---------------- empty wallet ---------------- */
  if (profile.isEmpty || !shadow) {
    return (
      <PageShell>
        <EmptyState
          title={`No history found on ${network?.name ?? 'this network'}`}
          body="No activity was found on the wallet's connected network. You can still query the wallet across the supported chains below."
          actionLabel="Choose another wallet"
          onAction={() => open()}
        />
        <TransactionExplorer connectedAddress={address} initialChain={connectedChain} />
      </PageShell>
    );
  }

  const attributes = attributeList(shadow.attributes);
  const meta = ARCHETYPE_META[shadow.archetype];

  const stats = [
    { label: 'Transactions', value: profile.transactions, icon: Activity },
    { label: 'Active days', value: profile.activeDays, icon: CalendarClock },
    { label: 'Protocols', value: profile.protocols, icon: Sparkles },
    { label: 'NFTs', value: profile.nftCount, icon: Fingerprint },
    { label: 'Wallet age (days)', value: profile.walletAge, icon: LineChart },
    { label: 'Tx / active day', value: profile.tradingFrequency, decimals: 2, icon: Activity },
  ];

  return (
    <PageShell>
      {/* ---------------- header ---------------- */}
      <motion.div variants={REVEAL} initial="hidden" animate="show" className="flex flex-col gap-6 pb-12 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="violet" icon={<Sparkles className="h-3 w-3" />}>
            My AI Shadow
          </Badge>
          <Badge tone="cyan">Live on-chain profile</Badge>
          <Badge tone="neutral">{network?.name ?? 'Connected network'}</Badge>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="display text-[2.4rem] uppercase text-white sm:text-[3.1rem] lg:text-[3.6rem]">
              {shadow.name}
            </h1>
            <p className="mt-4 max-w-xl text-[0.92rem] leading-relaxed text-echo-muted">{shadow.summary}</p>
          </div>
          <div className="shrink-0 text-left lg:text-right">
            <p className="kicker">Archetype</p>
            <p className="display mt-2 text-[1.6rem] text-gradient glow-text">{shadow.archetype}</p>
            <p className="mt-2 text-[0.76rem] text-echo-faint">{meta.tagline}</p>
          </div>
        </div>
      </motion.div>

      {/* ---------------- portrait + identity ---------------- */}
      <div className="grid gap-6 pb-14 lg:grid-cols-[0.82fr_1.18fr]">
        <motion.div variants={REVEAL} initial="hidden" animate="show" transition={{ delay: 0.1 }}>
          <Panel frame className="p-6">
            <FigurePanel
              variant="shadow"
              label={shadow.archetype}
              sublabel={`Shadow ID ${shadow.id}`}
              sublabelTone="violet"
              src="/assets/echo/ai-shadow-v2.png"
              alt="AI Shadow holographic portrait"
            />
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-5">
              <MetaCell label="Confidence" value={`${shadow.attributes.confidence}`} />
              <MetaCell label="Created" value={formatDate(shadow.createdAt)} />
            </div>
          </Panel>
        </motion.div>

        <motion.div
          variants={REVEAL}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.18 }}
          className="flex flex-col gap-6"
        >
          {/* identity strip */}
          <Panel className="grid grid-cols-2 gap-y-6 p-6 sm:grid-cols-4">
            <MetaCell label="Wallet" value={shortAddress(profile.address, 2, 4)} icon={<Wallet className="h-3 w-3" />} mono />
            <MetaCell label="AI archetype" value={shadow.archetype} />
            <MetaCell label="Created" value={formatDate(shadow.createdAt)} />
            <MetaCell label="Shadow ID" value={shadow.id} mono />
          </Panel>

          {/* attributes + radar */}
          <div className="grid flex-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Panel className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <span className="kicker">Decision model</span>
                <span className="mono text-[0.62rem] text-echo-faint">0 — 100</span>
              </div>
              <div className="flex flex-col gap-5">
                {attributes.map((attribute, index) => (
                  <AttributeBar
                    key={attribute.key}
                    label={attribute.label}
                    value={attribute.value}
                    blurb={attribute.blurb}
                    delay={index * 0.06}
                    accent={attribute.key === 'timing' ? 'cyan' : attribute.key === 'patience' ? 'blue' : 'violet'}
                  />
                ))}
              </div>
            </Panel>

            <Panel className="flex flex-col p-6">
              <span className="kicker">Shape</span>
              <div className="mt-3 flex-1">
                <ShadowRadar attributes={shadow.attributes} height={272} />
              </div>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-echo-faint">
                Simulated decision model derived from public wallet behaviour.
              </p>
            </Panel>
          </div>
        </motion.div>
      </div>

      {/* ---------------- personality ---------------- */}
      <motion.section
        variants={REVEAL}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="pb-14"
      >
        <Panel className="overflow-hidden">
          <div className="grid lg:grid-cols-[0.9fr_1.6fr]">
            <div className="border-b border-white/[0.07] p-7 lg:border-b-0 lg:border-r">
              <span className="kicker">On-chain personality</span>
              <p className="mt-4 text-[0.78rem] leading-relaxed text-echo-faint">
                Generated from the profile values above — the copy can never contradict the numbers.
              </p>
              <p className="mt-6 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
                <Fingerprint className="h-3 w-3" />
                {data?.summary.footprint ?? describeFootprint(profile)}
              </p>
            </div>
            <div className="relative p-7 lg:p-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_220px_at_90%_0%,rgba(120,100,255,0.12),transparent_70%)]"
              />
              <p className="relative text-[1.02rem] leading-relaxed text-white/90 lg:text-[1.12rem]">
                {shadow.personality}
              </p>
            </div>
          </div>
        </Panel>
      </motion.section>

      {/* ---------------- supporting stats ---------------- */}
      <section className="pb-14">
        <div className="mb-6 flex items-center justify-between">
          <span className="kicker">Supporting wallet statistics</span>
          <span className="text-[0.66rem] text-echo-faint">
            {data?.dataSource === 'indexer' ? 'Derived from live public-chain data' : 'Derived from deterministic demo data'}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Panel key={stat.label} className="p-5">
              <stat.icon className="h-3.5 w-3.5 text-echo-blue/70" />
              <p className="mono mt-4 text-[1.3rem] text-white">
                <AnimatedNumber value={stat.value} decimals={stat.decimals ?? 0} duration={1300} />
              </p>
              <p className="mt-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-echo-faint">{stat.label}</p>
            </Panel>
          ))}
        </div>
        <p className="mt-4 text-[0.66rem] text-echo-faint">
          {formatNumber(profile.transactions)} transactions across {formatNumber(profile.protocols)} protocols ·
          first seen {formatDate(profile.firstSeen)}
        </p>
      </section>

      <TransactionExplorer connectedAddress={activeAddress} initialChain={connectedChain} />

      {/* ---------------- next steps ---------------- */}
      <section className="pb-10">
        <Panel frame className="flex flex-col items-start justify-between gap-6 p-7 lg:flex-row lg:items-center lg:p-9">
          <div>
            <h2 className="display text-[1.4rem] uppercase text-white">Run the parallel timeline</h2>
            <p className="mt-3 max-w-xl text-[0.86rem] leading-relaxed text-echo-muted">
              Same window, two decision sets. See exactly where the Shadow diverged from you — and what it cost or
              earned.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <GlowButton href="/timeline" size="md">
              Open timeline
            </GlowButton>
            <GlowButton href="/battle" variant="ghost" size="md" icon={<GitCompareArrows className="h-3.5 w-3.5" />}>
              Battle a wallet
            </GlowButton>
          </div>
        </Panel>
        <p className="mt-5 text-[0.68rem] leading-relaxed text-echo-faint">
          Want a different Shadow?{' '}
          <Link href="/battle" className="text-echo-muted underline decoration-white/20 underline-offset-4 hover:text-white">
            Paste any wallet address
          </Link>{' '}
          and ECHO AI will generate its counterpart instantly.
        </p>
      </section>
    </PageShell>
  );
}

function MetaCell({
  label,
  value,
  icon,
  mono = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">
        {icon}
        {label}
      </p>
      <p className={`mt-2 text-[0.86rem] text-white ${mono ? 'mono' : ''}`}>{value}</p>
    </div>
  );
}

function EmptyState({ title, body, actionLabel, onAction }: { title: string; body: string; actionLabel: string; onAction: () => void }) {
  return (
    <motion.div variants={REVEAL} initial="hidden" animate="show" className="py-16">
      <Panel frame glow className="mx-auto max-w-xl p-9 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-echo-violet/30 bg-echo-violet/[0.08]">
          <Sparkles className="h-5 w-5 text-[#C7AEFF]" />
        </span>
        <h1 className="display mt-6 text-[1.6rem] uppercase text-white">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-[0.86rem] leading-relaxed text-echo-muted">{body}</p>
        <div className="mt-8 flex justify-center">
          <GlowButton onClick={onAction} size="md">
            {actionLabel}
          </GlowButton>
        </div>
      </Panel>
    </motion.div>
  );
}
