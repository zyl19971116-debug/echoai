'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe2, Search, Trophy } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Badge, SimulationBadge } from '@/components/ui/Badge';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { WorldComparisonChart } from '@/components/charts/WorldComparisonChart';
import { LEADERBOARD, WORLD_AI_EDGE, WORLD_SERIES, WORLD_STATS } from '@/data/demo';
import { ARCHETYPE_META } from '@/lib/archetypes';
import { cn, formatUsd, truncate } from '@/lib/format';

type SortKey = 'difference' | 'ai' | 'human' | 'rank';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'difference', label: 'Difference' },
  { key: 'ai', label: 'AI value' },
  { key: 'human', label: 'Human value' },
  { key: 'rank', label: 'Rank' },
];

export function WorldView() {
  const [sort, setSort] = useState<SortKey>('difference');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const filtered = query.trim()
      ? LEADERBOARD.filter((row) =>
          `${row.shadow} ${row.archetype} ${row.address}`.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : LEADERBOARD;

    return [...filtered].sort((a, b) => {
      if (sort === 'rank') return a.rank - b.rank;
      return (b[sort] as number) - (a[sort] as number);
    });
  }, [sort, query]);

  const stats = [
    { label: 'Total humans', value: WORLD_STATS.humans, tone: 'neutral' as const },
    { label: 'AI shadows', value: WORLD_STATS.shadows, tone: 'violet' as const },
    { label: 'Human value', value: WORLD_STATS.humanValue, format: 'compact-usd' as const, tone: 'blue' as const },
    { label: 'AI value', value: WORLD_STATS.aiValue, format: 'compact-usd' as const, tone: 'violet' as const },
  ];

  return (
    <PageShell>
      {/* ---------------- headline ---------------- */}
      <div className="flex flex-col gap-7 pb-12 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="blue" icon={<Globe2 className="h-3 w-3" />}>
            Global experiment
          </Badge>
          <SimulationBadge />
          <Badge tone="neutral">Demo world dataset</Badge>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <h1 className="display text-[2.4rem] uppercase text-white sm:text-[3.2rem] lg:text-[3.9rem]">
              The Echo World
            </h1>
            <p className="display mt-4 text-[1.15rem] uppercase tracking-[0.24em] text-gradient glow-text">
              Humans vs AI
            </p>
            <p className="mt-6 max-w-xl text-[0.92rem] leading-relaxed text-echo-muted">
              Every connected wallet creates a counterpart. This is the aggregate of all of them — humans on one side,
              AI Shadows on the other.
            </p>
          </div>

          <div className="flex items-center gap-4 lg:justify-end">
            <AvatarStack count={6} seed="echo-world" />
            <p className="max-w-[190px] text-[0.72rem] leading-relaxed text-echo-faint">
              <AnimatedNumber value={WORLD_STATS.humans} className="text-white" /> wallets have been forked into AI
              Shadows
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- stats ---------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <Panel className="p-6">
              <p className="text-[0.6rem] uppercase tracking-[0.22em] text-echo-faint">{stat.label}</p>
              <p
                className={cn(
                  'display mt-4 text-[1.9rem]',
                  stat.tone === 'violet' ? 'text-gradient glow-text' : 'text-white',
                )}
              >
                <AnimatedNumber
                  value={stat.value}
                  format={stat.format ?? 'number'}
                  duration={1500 + index * 120}
                />
              </p>
            </Panel>
          </motion.div>
        ))}
      </div>

      {/* ---------------- chart ---------------- */}
      <Panel frame className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
          <div>
            <span className="kicker">Aggregate notional value · 30 days</span>
            <p className="mt-2 text-[0.72rem] text-echo-faint">
              AI Shadows are {WORLD_AI_EDGE} percentage points ahead of their human counterparts.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em] text-echo-muted">
              <span className="h-[2px] w-5 bg-echo-blue" />
              Humans
            </span>
            <span className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.16em] text-echo-muted">
              <span className="h-[2px] w-5 bg-echo-violet" />
              AI shadows
            </span>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <WorldComparisonChart data={WORLD_SERIES} height={300} />
        </div>
      </Panel>

      {/* ---------------- leaderboard ---------------- */}
      <section className="pt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">Leaderboard</span>
            <h2 className="display mt-3 flex items-center gap-3 text-[1.6rem] uppercase text-white">
              <Trophy className="h-5 w-5 text-[#C7AEFF]" />
              Top shadows
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-echo-faint" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search shadow or archetype"
                aria-label="Search leaderboard"
                spellCheck={false}
                className="h-9 w-[220px] rounded-sm border border-white/[0.09] bg-void-800/60 pl-9 pr-3 text-[0.72rem] text-white outline-none transition-colors focus:border-echo-blue/55"
              />
            </div>
            <div className="flex gap-1">
              {SORTS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  onClick={() => setSort(entry.key)}
                  aria-pressed={sort === entry.key}
                  className={cn(
                    'rounded-sm border px-2.5 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
                    sort === entry.key
                      ? 'border-echo-blue/50 bg-echo-blue/12 text-white'
                      : 'border-white/[0.08] text-echo-faint hover:border-white/20 hover:text-echo-muted',
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {['Rank', 'Shadow', 'Archetype', 'Human', 'AI', 'Difference', 'Time'].map((head, index) => (
                    <th
                      key={head}
                      className={cn(
                        'px-5 py-3.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-echo-faint',
                        index > 2 && index < 6 && 'text-right',
                        index === 6 && 'text-right',
                      )}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <motion.tr
                    key={row.address}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.45, delay: Math.min(index * 0.025, 0.4) }}
                    className="group border-b border-white/[0.05] transition-colors duration-300 last:border-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'mono text-[0.8rem]',
                          row.rank === 1 ? 'text-[#C7AEFF]' : row.rank <= 3 ? 'text-white' : 'text-echo-muted',
                        )}
                      >
                        {String(row.rank).padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[0.82rem] font-medium text-white">{row.shadow}</p>
                      <p className="mono mt-1 text-[0.64rem] text-echo-faint">{truncate(row.address, 4, 4)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-1 text-[0.54rem] font-semibold uppercase tracking-[0.12em]',
                          'border-white/[0.09] bg-white/[0.03] text-echo-muted',
                        )}
                        style={{
                          borderColor: `${ARCHETYPE_META[row.archetype].accent === 'violet' ? 'rgba(155,107,255,0.35)' : ARCHETYPE_META[row.archetype].accent === 'cyan' ? 'rgba(59,232,255,0.3)' : 'rgba(76,141,255,0.32)'}`,
                        }}
                      >
                        {row.archetype}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="mono text-[0.8rem] text-white/85">{formatUsd(row.human)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="mono text-[0.8rem] text-[#C7AEFF]">{formatUsd(row.ai)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="mono text-[0.8rem] text-echo-cyan">+{row.difference.toFixed(1)}%</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="mono text-[0.72rem] text-echo-faint">{row.days}D</span>
                    </td>
                  </motion.tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[0.8rem] text-echo-faint">
                      No shadows matched that search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] px-6 py-4">
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
              Showing {rows.length} of {LEADERBOARD.length} demo shadows
            </p>
            <p className="text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
              All values simulated · deterministic demo dataset
            </p>
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}
