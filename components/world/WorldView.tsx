'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Globe2, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { GlowButton } from '@/components/ui/GlowButton';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import { useShadowCount } from '@/hooks/useShadowCount';

/**
 * The World page is the global aggregate view. It stays honest: until
 * aggregates can be verified against real connected wallets, it shows an
 * explicit empty state instead of simulated totals. Per-wallet simulation
 * (My Echo, Timeline, Battle) is unaffected.
 */
export function WorldView() {
  const { open } = useConnectFlow();
  const shadowCount = useShadowCount();

  return (
    <PageShell>
      {/* ---------------- headline ---------------- */}
      <div className="flex flex-col gap-7 pb-12 pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="blue" icon={<Globe2 className="h-3 w-3" />}>
            Global experiment
          </Badge>
          <Badge tone="neutral">Verified data only</Badge>
        </div>

        <div>
          <h1 className="display text-[2.4rem] uppercase text-white sm:text-[3.2rem] lg:text-[3.9rem]">
            The Echo World
          </h1>
          <p className="display mt-4 text-[1.15rem] uppercase tracking-[0.24em] text-gradient glow-text">
            Humans vs AI
          </p>
          <p className="mt-6 max-w-xl text-[0.92rem] leading-relaxed text-echo-muted">
            Every connected wallet creates a counterpart. The aggregate view unlocks once it can be
            verified against real connected wallets — no simulated totals are shown here.
          </p>
        </div>
      </div>

      {/* ---------------- empty state ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Panel frame className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(640px_260px_at_50%_0%,rgba(76,141,255,0.10),transparent_70%)]"
          />
          <div className="relative flex flex-col items-center px-6 py-16 text-center sm:py-20">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-echo-blue/25 bg-echo-blue/[0.06]">
              <Globe2 className="h-6 w-6 text-echo-blue" />
            </span>

            <h2 className="display mt-7 text-[1.5rem] uppercase text-white sm:text-[1.9rem]">
              No verified aggregate data yet
            </h2>

            <p className="mt-4 max-w-lg text-[0.84rem] leading-relaxed text-echo-muted">
              Human-vs-AI totals, the aggregate chart and the leaderboard will appear here once the
              experiment has verified data to show. We would rather show nothing than invent numbers.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <GlowButton onClick={() => open()} trailingIcon={<ArrowRight className="h-4 w-4" />}>
                Create your AI Shadow
              </GlowButton>
            </div>

            <p className="mt-8 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-echo-faint">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-echo-cyan" />
              {shadowCount === 0
                ? 'No wallets connected on this device yet'
                : `${shadowCount} ${shadowCount === 1 ? 'wallet' : 'wallets'} connected on this device`}
            </p>
          </div>
        </Panel>
      </motion.div>
    </PageShell>
  );
}
