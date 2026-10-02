'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Zap } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Badge } from '@/components/ui/Badge';
import { WorldComparisonChart } from '@/components/charts/WorldComparisonChart';
import { WORLD_AI_EDGE, WORLD_SERIES, WORLD_STATS } from '@/data/demo';

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

/**
 * THE ECHO WORLD — live panel
 *
 * The only place on the home page where aggregate numbers appear. It exists to
 * prove the experiment is running, not to sell a product.
 */
export function EchoWorldPanel() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      className="echo-world-home shell relative py-3 lg:py-4"
    >
      <Panel frame className="overflow-hidden">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          {/* ---- left: identity + counters ---- */}
          <div className="relative border-b border-white/[0.07] p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_240px_at_8%_0%,rgba(76,141,255,0.12),transparent_70%)]"
            />

            <div className="relative flex items-start justify-between gap-6">
              <div>
                <h2 className="display text-[1.7rem] uppercase text-white lg:text-[2.1rem]">The Echo World</h2>
                <p className="mt-3 max-w-sm text-[0.86rem] leading-relaxed text-echo-muted">
                  Humans vs AI — a real-time experiment.
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-echo-cyan/70" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-echo-cyan" />
                </span>
                Live
              </span>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-5">
              <div className="border-l border-echo-blue/40 pl-4">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-echo-faint">Humans</p>
                <p className="display mt-2.5 text-[1.9rem] text-white lg:text-[2.3rem]">
                  <AnimatedNumber value={WORLD_STATS.humanValue} format="compact-usd" duration={1700} />
                </p>
                <p className="mt-1.5 text-[0.72rem] text-echo-cyan">+{WORLD_STATS.humanChange}%</p>
              </div>
              <div className="border-l border-echo-violet/50 pl-4">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-echo-faint">
                  AI Shadows
                </p>
                <p className="display mt-2.5 text-[1.9rem] text-gradient glow-text lg:text-[2.3rem]">
                  <AnimatedNumber value={WORLD_STATS.aiValue} format="compact-usd" duration={1900} />
                </p>
                <p className="mt-1.5 text-[0.72rem] text-[#C7AEFF]">+{WORLD_STATS.aiChange}%</p>
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap items-center gap-3">
              <Badge tone="violet" icon={<Zap className="h-3 w-3" />}>
                AI is currently +{WORLD_AI_EDGE}% ahead
              </Badge>
              <Link
                href="/world"
                className="group flex items-center gap-1.5 text-[0.68rem] uppercase tracking-[0.18em] text-echo-muted transition-colors hover:text-white"
              >
                Full leaderboard
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <div className="relative mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-4">
              <div>
                <p className="mono text-[1.05rem] text-white">
                  {WORLD_STATS.humans.toLocaleString('en-US')}
                </p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">Humans tracked</p>
              </div>
              <div>
                <p className="mono text-[1.05rem] text-white">
                  {WORLD_STATS.shadows.toLocaleString('en-US')}
                </p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-echo-faint">AI Shadows active</p>
              </div>
            </div>
          </div>

          {/* ---- right: chart ---- */}
          <div className="relative p-5 lg:p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="kicker">Aggregate value · 30 days</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-echo-muted">
                  <span className="h-[2px] w-4 bg-echo-blue" />
                  Humans
                </span>
                <span className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-echo-muted">
                  <span className="h-[2px] w-4 bg-echo-violet" />
                  AI
                </span>
              </div>
            </div>

            <WorldComparisonChart data={WORLD_SERIES} height={236} />

            <p className="mt-5 text-[0.66rem] uppercase tracking-[0.16em] text-echo-faint">
              Simulated aggregate · not real trading performance
            </p>
          </div>
        </div>
      </Panel>
    </motion.section>
  );
}
