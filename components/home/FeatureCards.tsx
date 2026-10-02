'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Swords } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import { ARCHETYPE_SAMPLES, DEMO_PROFILE, DEMO_PORTFOLIO, DEMO_SHADOW, BATTLE_EXAMPLE_WALLET } from '@/data/demo';
import { sliceSeries } from '@/lib/shadowEngine';
import { ADDRESS_PATTERN } from '@/lib/walletAnalysis';
import { cn, formatUsd, truncate } from '@/lib/format';
import type { RangeKey } from '@/types';

const CARD_MOTION = {
  hidden: { opacity: 0, y: 30 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function CardShell({
  index,
  title,
  description,
  children,
}: {
  index: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Panel className="group/card flex h-full flex-col overflow-hidden transition-all duration-500 ease-echo hover:border-echo-blue/25">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_180px_at_50%_-15%,rgba(90,120,255,0.14),transparent_72%)] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
      />
      <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5">
        <div>
          <p className="kicker">{index}</p>
          <h3 className="display mt-2.5 text-[1.06rem] uppercase text-white">{title}</h3>
        </div>
        <span className="mono text-[0.62rem] text-echo-faint/70">{index}</span>
      </div>
      <p className="relative px-6 pt-5 text-[0.8rem] leading-relaxed text-echo-muted">{description}</p>
      <div className="relative flex flex-1 flex-col px-6 pb-6 pt-5">{children}</div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* 01 — CONNECT                                                        */
/* ------------------------------------------------------------------ */

function ConnectCard() {
  const { open } = useConnectFlow();
  const rows = [
    { label: 'Transactions', value: DEMO_PROFILE.transactions, format: 'number' as const },
    { label: 'NFTs', value: DEMO_PROFILE.nftCount, format: 'number' as const },
    { label: 'Protocols', value: DEMO_PROFILE.protocols, format: 'number' as const },
    { label: 'Active days', value: DEMO_PROFILE.activeDays, format: 'number' as const },
  ];

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-sm border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
        <span className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-echo-cyan/60" />
            <span className="relative h-2 w-2 rounded-full bg-echo-cyan" />
          </span>
          <span className="mono text-[0.72rem] text-white">{truncate(DEMO_PROFILE.address, 2, 4)}</span>
        </span>
        <span className="text-[0.58rem] uppercase tracking-[0.18em] text-echo-faint">Sample wallet</span>
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-4">
        {rows.map((row, index) => (
          <div key={row.label}>
            <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">{row.label}</dt>
            <dd className="mono mt-1.5 text-[1.05rem] text-white">
              <AnimatedNumber value={row.value} duration={1200 + index * 140} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-6">
        <GlowButton
          size="sm"
          variant="ghost"
          fullWidth
          onClick={() => open()}
          trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
        >
          Connect wallet
        </GlowButton>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — MEET YOUR AI SHADOW                                            */
/* ------------------------------------------------------------------ */

function ShadowCard() {
  const analyses = ['Risk profile', 'Trading style', 'Activity', 'Holding behaviour', 'Protocol usage'];

  return (
    <>
      <div className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center rounded-sm border border-white/[0.07] bg-white/[0.02] py-4">
          <span className="text-[0.58rem] uppercase tracking-[0.24em] text-echo-faint">You</span>
          <span className="mt-2 h-9 w-9 rounded-full border border-echo-blue/40 bg-[radial-gradient(circle,rgba(76,141,255,0.35),transparent_70%)]" />
        </div>
        <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-echo-faint">VS</span>
        <div className="flex flex-col items-center rounded-sm border border-echo-violet/25 bg-echo-violet/[0.06] py-4">
          <span className="text-[0.58rem] uppercase tracking-[0.24em] text-[#C7AEFF]">AI you</span>
          <span className="mt-2 h-9 w-9 animate-pulse-glow rounded-full border border-echo-violet/60 bg-[radial-gradient(circle,rgba(155,107,255,0.5),transparent_72%)]" />
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {analyses.map((label) => (
          <li key={label} className="flex items-center gap-2.5 text-[0.72rem] text-echo-muted">
            <span className="h-1 w-1 rounded-full bg-echo-violet/70" />
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">Archetype generated</p>
        <p className="display mt-2 text-[1.15rem] text-gradient glow-text">{DEMO_SHADOW.archetype}</p>
      </div>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
        {ARCHETYPE_SAMPLES.map((archetype) => (
          <span
            key={archetype}
            className={cn(
              'rounded-full border px-2 py-[3px] text-[0.52rem] font-semibold uppercase tracking-[0.12em]',
              archetype === DEMO_SHADOW.archetype
                ? 'border-echo-violet/45 bg-echo-violet/12 text-[#C7AEFF]'
                : 'border-white/[0.08] bg-white/[0.02] text-echo-faint',
            )}
          >
            {archetype}
          </span>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — PARALLEL TIMELINE                                              */
/* ------------------------------------------------------------------ */

const RANGES: RangeKey[] = ['7D', '30D', '90D', '1Y', 'ALL'];

function TimelineCard() {
  const [range, setRange] = useState<RangeKey>('30D');

  const sliced = useMemo(() => sliceSeries(DEMO_PORTFOLIO, range), [range]);
  const last = sliced[sliced.length - 1];

  return (
    <>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">Your wallet</p>
          <p className="mono mt-1.5 text-[1.02rem] text-white">{formatUsd(last.human)}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">AI shadow</p>
          <p className="mono mt-1.5 text-[1.02rem] text-[#C7AEFF]">{formatUsd(last.ai)}</p>
        </div>
      </div>

      <PortfolioChart data={sliced} height={132} compact showAxis={false} />

      <div className="mt-4 flex flex-wrap gap-1.5">
        {RANGES.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setRange(entry)}
            className={cn(
              'rounded-sm border px-2.5 py-1.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
              range === entry
                ? 'border-echo-blue/50 bg-echo-blue/12 text-white'
                : 'border-white/[0.08] text-echo-faint hover:border-white/20 hover:text-echo-muted',
            )}
            aria-pressed={range === entry}
          >
            {entry}
          </button>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <GlowButton
          size="sm"
          variant="ghost"
          fullWidth
          href="/timeline"
          trailingIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
        >
          Open full timeline
        </GlowButton>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — BATTLE ANY WALLET                                              */
/* ------------------------------------------------------------------ */

function BattleCard() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const input = value.trim();
    if (!input) {
      setError('Paste any public wallet address to create a battle.');
      return;
    }
    if (!ADDRESS_PATTERN.test(input)) {
      setError('That does not look like a wallet address (0x + 40 characters).');
      return;
    }
    setError(null);
    router.push(`/battle?one=${DEMO_PROFILE.address}&two=${input}`);
  };

  return (
    <>
      <label htmlFor="battle-address" className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">
        Paste wallet address
      </label>
      <input
        id="battle-address"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (error) setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit();
        }}
        placeholder="0x..."
        spellCheck={false}
        autoComplete="off"
        className={cn(
          'mono mt-2 h-11 w-full rounded-sm border bg-void-800/60 px-3.5 text-[0.76rem] text-white outline-none transition-colors duration-300',
          error ? 'border-[#FF9C7A]/50' : 'border-white/[0.09] focus:border-echo-blue/55',
        )}
      />
      {error ? (
        <p className="mt-2 text-[0.68rem] text-[#FFB49A]">{error}</p>
      ) : (
        <p className="mt-2 text-[0.68rem] text-echo-faint">
          Example: {truncate(BATTLE_EXAMPLE_WALLET, 4, 4)}
        </p>
      )}

      <div className="mt-4">
        <GlowButton size="sm" fullWidth onClick={submit} icon={<Swords className="h-3.5 w-3.5" />}>
          Create battle
        </GlowButton>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Badge tone="blue" className="px-2 py-[3px] text-[0.5rem]">
          Your shadow
        </Badge>
        <span className="text-[0.58rem] uppercase tracking-[0.16em] text-echo-faint">vs</span>
        <Badge tone="violet" className="px-2 py-[3px] text-[0.5rem]">
          Their shadow
        </Badge>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Grid                                                                */
/* ------------------------------------------------------------------ */

export function FeatureCards() {
  const cards = [
    {
      index: '01',
      title: 'Connect',
      description: 'Link your wallet and let AI analyse your real on-chain history.',
      body: <ConnectCard />,
    },
    {
      index: '02',
      title: 'Meet your AI Shadow',
      description: 'Same history, different decisions. A full behavioural model of the wallet that never existed.',
      body: <ShadowCard />,
    },
    {
      index: '03',
      title: 'Parallel timeline',
      description: 'Replay the same window twice: once as you moved, once as the Shadow would have.',
      body: <TimelineCard />,
    },
    {
      index: '04',
      title: 'Battle any wallet',
      description: 'Pit your Shadow against any other wallet in the world and watch the simulation resolve.',
      body: <BattleCard />,
    },
  ];

  return (
    <section className="echo-feature-grid shell relative pb-8 pt-3 lg:pb-10 lg:pt-4">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.index}
            custom={index}
            variants={CARD_MOTION}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.18 }}
          >
            <CardShell index={card.index} title={card.title} description={card.description}>
              {card.body}
            </CardShell>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
