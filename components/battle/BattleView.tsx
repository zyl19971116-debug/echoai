'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2, RefreshCw, Swords, Trophy } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Badge, SimulationBadge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { BattleChart } from '@/components/charts/BattleChart';
import { ShareCard } from '@/components/share/ShareCard';
import { BATTLE_TIME_OPTIONS } from '@/data/demo';
import { isValidAddress, shortAddress } from '@/lib/walletAnalysis';
import { ARCHETYPE_META } from '@/lib/archetypes';
import { cn, formatSignedPercent, formatUsd } from '@/lib/format';
import type { ApiEnvelope, BattleResult, BattleSideResult, TransactionChain } from '@/types';
import { TRANSACTION_CHAINS } from '@/lib/chains';
import { useWallet } from '@/hooks/useWallet';

type BattleViewResult = BattleResult & { dataSource?: 'mock' | 'indexer'; chainOne?: TransactionChain; chainTwo?: TransactionChain };

const EVM_CHAINS = (Object.entries(TRANSACTION_CHAINS) as Array<[TransactionChain, (typeof TRANSACTION_CHAINS)[TransactionChain]]>)
  .filter(([, item]) => item.address === 'evm');

function chainFromId(chainId?: number): TransactionChain {
  return EVM_CHAINS.find(([, item]) => item.chainId === chainId)?.[0] ?? 'eth';
}

interface BattleViewProps {
  initialOne?: string;
  initialTwo?: string;
}

export function BattleView({ initialOne, initialTwo }: BattleViewProps) {
  const { address, network } = useWallet();
  const [one, setOne] = useState(initialOne ?? '');
  const [two, setTwo] = useState(initialTwo ?? '');
  const [chainOne, setChainOne] = useState<TransactionChain>('eth');
  const [chainTwo, setChainTwo] = useState<TransactionChain>('eth');
  const [days, setDays] = useState<number>(30);
  const [result, setResult] = useState<BattleViewResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<{ one?: string; two?: string }>({});

  useEffect(() => {
    if (address && !initialOne) setOne((current) => current || address);
    if (network?.chainId && !initialOne) setChainOne(chainFromId(network.chainId));
  }, [address, network?.chainId, initialOne]);

  const recompute = async (nextDays: number, nextOne: string, nextTwo: string, nextChainOne: TransactionChain, nextChainTwo: TransactionChain) => {
    setGenerating(true);
    setErrors({});
    try {
      const response = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ one: nextOne, two: nextTwo, days: nextDays, chainOne: nextChainOne, chainTwo: nextChainTwo }),
      });
      const body = (await response.json()) as ApiEnvelope<BattleViewResult>;
      if (!body.ok || !body.data) throw new Error(body.error?.message ?? 'Battle analysis failed.');
      setResult(body.data);
    } catch (error) {
      setErrors({
        one: error instanceof Error ? error.message : 'This wallet could not be analysed. Check the address and try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    const nextErrors: { one?: string; two?: string } = {};
    if (!isValidAddress(one)) nextErrors.one = 'Enter a valid address: 0x followed by 40 characters.';
    if (!isValidAddress(two)) nextErrors.two = 'Enter a valid address: 0x followed by 40 characters.';
    if (one.trim().toLowerCase() === two.trim().toLowerCase()) {
      nextErrors.two = 'Pick a different wallet — a Shadow cannot battle itself.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await recompute(days, one, two, chainOne, chainTwo);
  };

  const handleRangeChange = async (nextDays: number) => {
    setDays(nextDays);
    if (result) {
      await recompute(nextDays, result.left.address, result.right.address, result.chainOne ?? chainOne, result.chainTwo ?? chainTwo);
    }
  };

  const winner = result?.winner;
  const edge = useMemo(() => {
    if (!result) return 0;
    return Math.round(Math.abs(result.left.growth - result.right.growth) * 10) / 10;
  }, [result]);

  return (
    <PageShell>
      {/* ---------------- headline ---------------- */}
      <div className="flex flex-col gap-6 pb-12 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="violet" icon={<Swords className="h-3 w-3" />}>
            Shadow battle
          </Badge>
          <SimulationBadge />
          <Badge tone="cyan">Live wallet profiles</Badge>
        </div>

        <h1 className="display max-w-3xl text-[2.4rem] uppercase text-white sm:text-[3.2rem] lg:text-[3.9rem]">
          Shadow <span className="text-gradient glow-text">battle</span>
        </h1>
        <p className="display text-[0.95rem] uppercase tracking-[0.26em] text-echo-faint">
          Any wallet. Any shadow.
        </p>
        <p className="max-w-2xl text-[0.92rem] leading-relaxed text-echo-muted">
          Paste two public addresses. ECHO AI² builds both Shadows, replays the same window for each, and shows which
          decision model came out ahead.
        </p>
      </div>

      {/* ---------------- inputs ---------------- */}
      <Panel frame className="p-6 lg:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <WalletField
            id="player-one"
            label="Player one"
            tone="blue"
            value={one}
            error={errors.one}
            onChange={(value) => {
              setOne(value);
              setResult(null);
              if (errors.one) setErrors((prev) => ({ ...prev, one: undefined }));
            }}
            chain={chainOne}
            onChainChange={(value) => { setChainOne(value); setResult(null); }}
          />

          <div className="hidden h-11 items-center justify-center lg:flex">
            <span className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-echo-faint">vs</span>
          </div>

          <WalletField
            id="player-two"
            label="Player two"
            tone="violet"
            value={two}
            error={errors.two}
            onChange={(value) => {
              setTwo(value);
              setResult(null);
              if (errors.two) setErrors((prev) => ({ ...prev, two: undefined }));
            }}
            chain={chainTwo}
            onChainChange={(value) => { setChainTwo(value); setResult(null); }}
          />
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <GlowButton
              onClick={handleGenerate}
              disabled={generating}
              size="md"
              icon={generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Swords className="h-3.5 w-3.5" />}
            >
              {generating ? 'Running simulation' : 'Generate battle'}
            </GlowButton>
            <GlowButton
              size="md"
              variant="ghost"
              onClick={() => {
                setOne(address ?? '');
                setTwo('');
                setChainOne(chainFromId(network?.chainId));
                setChainTwo('eth');
                setDays(30);
                setResult(null);
                setErrors({});
              }}
              icon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Reset
            </GlowButton>
          </div>

          <div className="flex items-center gap-2">
            <span className="mr-1 text-[0.6rem] uppercase tracking-[0.18em] text-echo-faint">Window</span>
            {BATTLE_TIME_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => void handleRangeChange(option)}
                aria-pressed={days === option}
                className={cn(
                  'rounded-sm border px-3 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300',
                  days === option
                    ? 'border-echo-blue/50 bg-echo-blue/12 text-white'
                    : 'border-white/[0.08] text-echo-faint hover:border-white/20 hover:text-echo-muted',
                )}
              >
                {option} days
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-[0.68rem] uppercase tracking-[0.16em] text-echo-faint">
          Real public-chain profiles · read-only · no signature · no transaction · battle performance is simulated
        </p>
      </Panel>

      {/* ---------------- result ---------------- */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={`${result.left.address}-${result.right.address}-${result.days}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* champion banner */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Badge tone="violet" icon={<Trophy className="h-3 w-3" />}>
                {winner === 'draw'
                  ? 'Dead heat'
                  : `${result[winner === 'left' ? 'left' : 'right'].shadow.archetype} wins by ${edge}%`}
              </Badge>
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-echo-faint">
                {result.days}-day simulation · both shadows start from $1,000
              </span>
            </div>

            {/* combatant cards */}
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <CombatantCard
                side={result.left}
                tone="blue"
                label="Your shadow"
                winner={winner === 'left'}
              />
              <CombatantCard
                side={result.right}
                tone="violet"
                label="Their shadow"
                winner={winner === 'right'}
              />
            </div>

            {/* metric comparison */}
            <Panel className="mt-6 p-6 lg:p-7">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                <span className="kicker">Attribute comparison</span>
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-echo-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-echo-blue" />
                    {shortAddress(result.left.address, 2, 4)}
                  </span>
                  <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-echo-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-echo-violet" />
                    {shortAddress(result.right.address, 2, 4)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {result.metrics.map((metric, index) => (
                  <MetricRow
                    key={metric.key}
                    label={metric.label}
                    left={metric.left}
                    right={metric.right}
                    delay={index * 0.06}
                  />
                ))}
              </div>
            </Panel>

            {/* simulation chart */}
            <Panel frame className="mt-6 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-4">
                <span className="kicker">Simulation result · {result.days} days</span>
                <span className="text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">Simulated</span>
              </div>
              <div className="p-5 sm:p-7">
                <BattleChart
                  data={result.series}
                  height={320}
                  leftLabel={result.left.shadow.archetype}
                  rightLabel={result.right.shadow.archetype}
                />
              </div>
            </Panel>

            {/* share */}
            <section className="pt-14">
              <ShareCard
                humanGrowth={result.left.growth}
                aiGrowth={result.right.growth}
                days={result.days}
                archetype={result.left.shadow.archetype}
                address={result.left.address}
              />
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

function WalletField({
  id,
  label,
  tone,
  value,
  onChange,
  error,
  chain,
  onChainChange,
}: {
  id: string;
  label: string;
  tone: 'blue' | 'violet';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  chain: TransactionChain;
  onChainChange: (chain: TransactionChain) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          'text-[0.6rem] font-semibold uppercase tracking-[0.22em]',
          tone === 'violet' ? 'text-[#C7AEFF]' : 'text-[#9FC2FF]',
        )}
      >
        {label}
      </label>
      <div className="mt-2.5 grid grid-cols-[132px_1fr] gap-2">
        <select value={chain} onChange={(event) => onChainChange(event.target.value as TransactionChain)}
          className="h-11 rounded-sm border border-white/[0.09] bg-void-800/90 px-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-white outline-none focus:border-echo-blue/50">
          {EVM_CHAINS.map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
        </select>
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          autoComplete="off"
          placeholder="0x..."
          className={cn(
            'mono h-11 w-full rounded-sm border bg-void-800/60 px-3.5 text-[0.76rem] text-white outline-none transition-colors duration-300',
            error
              ? 'border-[#FF9C7A]/50'
              : tone === 'violet'
                ? 'border-white/[0.09] focus:border-echo-violet/60'
                : 'border-white/[0.09] focus:border-echo-blue/60',
          )}
        />
      </div>
      {error ? (
        <p className="mt-2 flex items-center gap-1.5 text-[0.68rem] text-[#FFB49A]">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      ) : (
        <p className="mt-2 text-[0.68rem] text-echo-faint">
          {isValidAddress(value) ? shortAddress(value, 4, 4) : 'Public address · read-only'}
        </p>
      )}
    </div>
  );
}

function CombatantCard({
  side,
  tone,
  label,
  winner,
}: {
  side: BattleSideResult;
  tone: 'blue' | 'violet';
  label: string;
  winner: boolean;
}) {
  const meta = ARCHETYPE_META[side.shadow.archetype];

  return (
    <Panel
      frame={winner}
      glow={winner}
      className={cn(
        'relative overflow-hidden p-6 lg:p-7',
        winner && (tone === 'violet' ? 'border-echo-violet/40' : 'border-echo-blue/40'),
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0',
          tone === 'violet'
            ? 'bg-[radial-gradient(420px_200px_at_50%_0%,rgba(155,107,255,0.16),transparent_72%)]'
            : 'bg-[radial-gradient(420px_200px_at_50%_0%,rgba(76,141,255,0.14),transparent_72%)]',
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <span className={cn('text-[0.6rem] font-semibold uppercase tracking-[0.22em]', tone === 'violet' ? 'text-[#C7AEFF]' : 'text-[#9FC2FF]')}>
            {label}
          </span>
          <p className="display mt-3 text-[1.6rem] uppercase text-white">{side.shadow.archetype}</p>
          <p className="mt-2 text-[0.74rem] text-echo-faint">{meta.tagline}</p>
        </div>
        {winner && (
          <Badge tone="violet" icon={<Trophy className="h-3 w-3" />} className="shrink-0 px-2 py-[3px] text-[0.5rem]">
            Winner
          </Badge>
        )}
      </div>

      <div className="relative mt-7 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.2em] text-echo-faint">Growth</p>
          <p className="mono mt-2 text-[1.5rem] text-white">{formatSignedPercent(side.growth)}</p>
        </div>
        <div>
          <p className="text-[0.58rem] uppercase tracking-[0.2em] text-echo-faint">End value</p>
          <p className="mono mt-2 text-[1.5rem] text-white">{formatUsd(side.endValue)}</p>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.07] pt-5 text-[0.68rem] text-echo-faint">
        <span className="mono">{shortAddress(side.address, 4, 4)}</span>
        <span>{side.profile.transactions.toLocaleString('en-US')} tx</span>
        <span>{side.profile.protocols} protocols</span>
        <span>{side.profile.activeDays} active days</span>
      </div>
      <div className="relative mt-3 flex flex-wrap gap-x-3 text-[0.64rem] text-echo-faint">
        <span>
          Market signal {side.profile.performanceConfidence
            ? formatSignedPercent(side.profile.performanceScore ?? 0)
            : 'unavailable'}
        </span>
        <span>·</span>
        <span>
          {side.profile.performanceSampleSize ?? 0} priced transfers · {side.profile.performanceConfidence ?? 0}% confidence
        </span>
      </div>
    </Panel>
  );
}

function MetricRow({
  label,
  left,
  right,
  delay,
}: {
  label: string;
  left: number;
  right: number;
  delay: number;
}) {
  const leftLeads = left > right;
  const rightLeads = right > left;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className={cn('mono text-[0.85rem]', leftLeads ? 'text-white' : 'text-echo-muted')}>
          {Math.round(left)}
        </span>
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-echo-faint">{label}</span>
        <span className={cn('mono text-[0.85rem]', rightLeads ? 'text-white' : 'text-echo-muted')}>
          {Math.round(right)}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="flex h-[3px] justify-end overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#2B5FC7,#4C8DFF)]"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(2, left)}%` }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="flex h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#5B3EC7,#9B6BFF)]"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.max(2, right)}%` }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  );
}
