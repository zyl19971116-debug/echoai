'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarRange, Loader2, TrendingUp } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Badge, SimulationBadge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { useWallet } from '@/hooks/useWallet';
import { shortAddress } from '@/lib/walletAnalysis';
import { growthFromSeries } from '@/lib/shadowEngine';
import { cn, formatDate, formatSignedPercent, formatUsd } from '@/lib/format';
import type { RangeKey } from '@/types';
import { useShadowAnalysis } from '@/hooks/useShadowAnalysis';
import { useConnectFlow } from '@/hooks/useConnectFlow';

const RANGES: { key: RangeKey; label: string; days: number; caption: string }[] = [
  { key: '7D', label: '7D', days: 7, caption: 'Last 7 days' },
  { key: '30D', label: '30D', days: 30, caption: 'Last 30 days' },
  { key: '90D', label: '90D', days: 90, caption: 'Last 90 days' },
  { key: '1Y', label: '1Y', days: 365, caption: 'Last 12 months' },
  { key: 'ALL', label: 'ALL', days: 365, caption: 'Full simulation' },
];

const VERDICT_TONE = {
  AI: 'violet',
  HUMAN: 'blue',
  EVEN: 'neutral',
} as const;

export function TimelineView() {
  const { address, network } = useWallet();
  const { open } = useConnectFlow();
  const [range, setRange] = useState<RangeKey>('30D');

  const activeAddress = address ?? '';

  const active = RANGES.find((entry) => entry.key === range) ?? RANGES[1];
  const { data, loading, error } = useShadowAnalysis(activeAddress, active.days, network?.chainId, Boolean(address));
  const profile = data?.profile;
  const series = data?.series ?? [];
  const events = data?.events ?? [];

  if (!address) {
    return <PageShell><Panel frame className="mx-auto mt-16 max-w-xl p-8 text-center"><h1 className="display text-xl uppercase text-white">Connect your wallet</h1><p className="mt-4 text-sm text-echo-muted">Connect a real wallet before opening its timeline.</p><div className="mt-7 flex justify-center"><GlowButton onClick={() => open()} size="md">Connect wallet</GlowButton></div></Panel></PageShell>;
  }

  if (loading && !data) {
    return <PageShell><div className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-echo-blue" /><p className="kicker mt-4">Building parallel timeline</p></div></div></PageShell>;
  }

  if (!profile || !series.length || error) {
    return <PageShell><Panel frame className="mx-auto mt-16 max-w-xl p-8 text-center"><h1 className="display text-xl uppercase text-white">Timeline unavailable</h1><p className="mt-4 text-sm text-echo-muted">{error ?? 'No usable wallet history was returned.'}</p></Panel></PageShell>;
  }

  const growth = growthFromSeries(series);
  const last = series[series.length - 1];
  const first = series[0];
  const edge = growth.ai - growth.human;

  /* For short windows the event list would be sparse — pad it out. */
  const visibleEvents = events;

  return (
    <PageShell>
      {/* ---------------- headline ---------------- */}
      <div className="flex flex-col gap-6 pb-12 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="blue" icon={<CalendarRange className="h-3 w-3" />}>
            Parallel timeline
          </Badge>
          <SimulationBadge />
          <Badge tone="cyan">Live wallet profile · {network?.name ?? 'connected network'}</Badge>
        </div>

        <h1 className="display max-w-4xl text-[2.4rem] uppercase text-white sm:text-[3.2rem] lg:text-[4rem]">
          Two wallets.
          <br />
          One <span className="text-gradient glow-text">beginning.</span>
        </h1>

        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-echo-muted">
          Both lines start from the same notional balance of $1,000. Everything after that is the result of decisions
          — yours, and the ones the Shadow would have made instead.
        </p>
      </div>

      {/* ---------------- controls ---------------- */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setRange(entry.key)}
              aria-pressed={range === entry.key}
              className={cn(
                'rounded-sm border px-3.5 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300',
                range === entry.key
                  ? 'border-echo-blue/50 bg-echo-blue/12 text-white'
                  : 'border-white/[0.08] text-echo-faint hover:border-white/20 hover:text-echo-muted',
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <p className="mono text-[0.68rem] text-echo-faint">
          {shortAddress(profile.address, 2, 4)} · {active.caption}
        </p>
      </div>

      {/* ---------------- chart ---------------- */}
      <motion.div
        key={range}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Panel frame className="overflow-hidden">
          <div className="grid grid-cols-2 border-b border-white/[0.07] lg:grid-cols-4">
            <ValueCell
              label="You · human"
              value={formatUsd(last.human)}
              delta={formatSignedPercent(growth.human)}
              tone="blue"
            />
            <ValueCell
              label="AI shadow"
              value={formatUsd(last.ai)}
              delta={formatSignedPercent(growth.ai)}
              tone="violet"
            />
            <ValueCell label="Shadow edge" value={formatSignedPercent(edge)} tone="cyan" />
            <ValueCell
              label="Window"
              value={`${active.days} days`}
              caption={`from ${formatUsd(first.human)}`}
              tone="neutral"
            />
          </div>

          <div className="p-5 sm:p-7">
            <PortfolioChart data={series} height={360} humanLabel="You" aiLabel="AI Shadow" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] px-6 py-4">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em] text-echo-muted">
                <span className="h-[2px] w-5 bg-echo-blue" />
                You
              </span>
              <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em] text-echo-muted">
                <span className="h-[2px] w-5 bg-echo-violet" />
                AI shadow
              </span>
            </div>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
              Simulated values · no trades were executed
            </p>
          </div>
        </Panel>
      </motion.div>

      {/* ---------------- events ---------------- */}
      <section className="pt-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">Decision log</span>
            <h2 className="display mt-3 text-[1.6rem] uppercase text-white">Where the paths diverged</h2>
          </div>
          <p className="text-[0.72rem] text-echo-faint">
            {visibleEvents.length} key moments · {profile.activeDays.toLocaleString('en-US')} active days replayed
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {visibleEvents.map((event, index) => (
            <motion.div
              key={`${event.day}-${index}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Panel className="grid gap-5 p-5 lg:grid-cols-[92px_1fr_1fr_110px] lg:items-center">
                <div>
                  <p className="mono text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">Day</p>
                  <p className="mono mt-1 text-[1.15rem] text-white">
                    {String(event.day).padStart(2, '0')}
                  </p>
                </div>

                <DecisionCell label="You" text={event.humanAction} tone="blue" />
                <DecisionCell label="AI shadow" text={event.aiAction} tone="violet" />

                <div className="flex items-center lg:justify-end">
                  <Badge tone={VERDICT_TONE[event.verdict]} className="px-2.5 py-1 text-[0.52rem]">
                    {event.verdict === 'EVEN' ? 'Even' : `${event.verdict} ahead`}
                  </Badge>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- summary ---------------- */}
      <section className="pt-14">
        <Panel frame glow className="grid gap-8 p-7 lg:grid-cols-3 lg:p-9">
          <div className="lg:col-span-2">
            <span className="kicker">Simulation summary</span>
            <h2 className="display mt-4 text-[1.5rem] uppercase text-white">
              The Shadow {edge >= 0 ? 'is ahead by' : 'is behind by'}{' '}
              <span className="text-gradient glow-text">
                <AnimatedNumber value={Math.abs(edge)} decimals={1} suffix="%" />
              </span>
            </h2>
            <p className="mt-5 max-w-2xl text-[0.88rem] leading-relaxed text-echo-muted">
              Over {active.days} days the human wallet moved {formatUsd(first.human)} → {formatUsd(last.human)} (
              {formatSignedPercent(growth.human)}), while the AI Shadow moved {formatUsd(first.ai)} →{' '}
              {formatUsd(last.ai)} ({formatSignedPercent(growth.ai)}). Same start, same market, different decisions.
            </p>
            <p className="mt-5 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-echo-faint">
              <TrendingUp className="h-3 w-3" />
              Results are simulated and are not investment advice
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3 lg:border-l lg:border-white/[0.07] lg:pl-8">
            <GlowButton href="/battle" size="md" fullWidth>
              Battle a wallet
            </GlowButton>
            <GlowButton href="/my-echo" variant="ghost" size="md" fullWidth>
              Back to my shadow
            </GlowButton>
            <GlowButton href="/world" variant="ghost" size="md" fullWidth>
              See the world
            </GlowButton>
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}

function ValueCell({
  label,
  value,
  delta,
  caption,
  tone,
}: {
  label: string;
  value: string;
  delta?: string;
  caption?: string;
  tone: 'blue' | 'violet' | 'cyan' | 'neutral';
}) {
  const toneClass =
    tone === 'violet'
      ? 'text-[#C7AEFF]'
      : tone === 'blue'
        ? 'text-white'
        : tone === 'cyan'
          ? 'text-echo-cyan'
          : 'text-echo-muted';

  return (
    <div className="border-b border-r border-white/[0.06] p-5 last:border-r-0 lg:border-b-0">
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">{label}</p>
      <p className={cn('mono mt-2.5 text-[1.15rem] lg:text-[1.3rem]', toneClass)}>{value}</p>
      {delta && <p className="mt-1.5 text-[0.7rem] text-echo-faint">{delta}</p>}
      {caption && <p className="mt-1.5 text-[0.7rem] text-echo-faint">{caption}</p>}
    </div>
  );
}

function DecisionCell({ label, text, tone }: { label: string; text: string; tone: 'blue' | 'violet' }) {
  return (
    <div className={cn('border-l pl-4', tone === 'violet' ? 'border-echo-violet/40' : 'border-echo-blue/40')}>
      <p
        className={cn(
          'text-[0.6rem] uppercase tracking-[0.2em]',
          tone === 'violet' ? 'text-[#C7AEFF]' : 'text-echo-faint',
        )}
      >
        {label}
      </p>
      <p className="mt-1.5 text-[0.84rem] leading-relaxed text-white/85">{text}</p>
    </div>
  );
}
