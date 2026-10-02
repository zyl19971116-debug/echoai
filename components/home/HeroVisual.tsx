'use client';

import { motion, useTransform } from 'framer-motion';
import { FigurePanel } from '@/components/shadow/FigurePanel';
import { usePointerParallax } from '@/hooks/useParallax';
import { ARCHETYPE_META } from '@/lib/archetypes';
import { DEMO_SHADOW } from '@/data/demo';

/**
 * YOU · VS · AI YOU
 *
 * Two portraits, one shared origin. The connecting data lines are what turn
 * this from "two images" into "one experiment": the left figure feeds the
 * right figure, which is the premise of the product.
 */
export function HeroVisual() {
  const { x, y, onPointerMove, onPointerLeave } = usePointerParallax(1);

  const humanX = useTransform(x, (value) => value * -14);
  const humanY = useTransform(y, (value) => value * -8);
  const aiX = useTransform(x, (value) => value * 16);
  const aiY = useTransform(y, (value) => value * 10);

  return (
    <div className="echo-hero-visual relative w-full" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {/* shared stage glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[118%] w-[122%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(70,110,255,0.16),transparent_78%)]"
      />

      <div className="relative grid grid-cols-2 items-end gap-2 sm:gap-3 lg:gap-4">
        <motion.div style={{ x: humanX, y: humanY }} className="relative z-10">
          <FigurePanel
            variant="human"
            label="YOU"
            sublabel="Human wallet"
            src="/assets/echo/human-v2.png"
            alt="Silhouette representing the human wallet"
          />
        </motion.div>

        <motion.div style={{ x: aiX, y: aiY }} className="relative z-10">
          <FigurePanel
            variant="shadow"
            label="AI YOU"
            sublabel={DEMO_SHADOW.archetype}
            sublabelTone="violet"
            src="/assets/echo/ai-shadow-v2.png"
            alt="Holographic silhouette representing the AI Shadow"
          />
        </motion.div>

        {/* connecting data lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 140 420"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-1/2 top-[14%] z-20 hidden h-[62%] w-[86px] -translate-x-1/2 md:block"
        >
          <defs>
            <linearGradient id="hero-link" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4C8DFF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8FA9FF" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#9B6BFF" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          {[110, 210, 310].map((cy, index) => (
            <path
              key={cy}
              d={`M0 ${cy} C 46 ${cy - 26 + index * 8}, 94 ${cy + 26 - index * 8}, 140 ${cy}`}
              fill="none"
              stroke="url(#hero-link)"
              strokeWidth="1"
              strokeDasharray="5 9"
              className="animate-dash-flow"
              style={{ animationDelay: `${index * 0.7}s`, animationDuration: `${5 + index}s` }}
            />
          ))}
        </svg>

        {/* VS marker */}
        <div className="pointer-events-none absolute left-1/2 top-[52%] z-30 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full"
          >
            <span className="absolute inset-0 rounded-full bg-echo-gradient opacity-[0.22] blur-md" />
            <span className="absolute inset-0 rounded-full border border-white/12 bg-void-900/85 backdrop-blur-md" />
            <span className="relative text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white">VS</span>
          </motion.div>
        </div>
      </div>

      {/* status footer */}
      <div className="relative mt-3 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[0.6rem] uppercase tracking-[0.22em] text-echo-faint">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-echo-blue" />
          Same starting capital
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-echo-violet" />
          Different decisions
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-echo-cyan" />
          {ARCHETYPE_META[DEMO_SHADOW.archetype].tagline}
        </span>
      </div>
    </div>
  );
}
