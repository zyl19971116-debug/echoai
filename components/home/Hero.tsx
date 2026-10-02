'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Badge } from '@/components/ui/Badge';
import { HeroVisual } from './HeroVisual';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import { HERO_SOCIAL_PROOF } from '@/data/demo';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const { open } = useConnectFlow();

  return (
    <section className="echo-hero relative overflow-hidden">
      <div className="shell relative grid gap-10 pb-8 pt-7 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:gap-7 lg:pb-9 lg:pt-8">
        {/* ---------------- copy ---------------- */}
        <motion.div variants={container} initial="hidden" animate="show" className="relative z-10">
          <motion.div variants={item} className="mb-5 flex items-center gap-3">
            <Badge tone="blue" className="px-3 py-1.5">
              Every wallet leaves a shadow
            </Badge>
          </motion.div>

          <motion.h1
            variants={item}
            className="display text-[2.55rem] uppercase text-white sm:text-[3.25rem] lg:text-[3.7rem] xl:text-[4.25rem]"
          >
            What if
            <br />
            your wallet
            <br />
            had <span className="text-gradient glow-text">another life?</span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-[510px] text-[0.92rem] leading-relaxed text-echo-muted">
            ECHO AI² reads your on-chain history and creates an AI version of you.
            <br className="hidden sm:block" /> A parallel wallet. A parallel life.
            <span className="text-white/90"> Same start. Different choices.</span> Who will do better?
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3.5">
            <GlowButton
              size="lg"
              onClick={() => open()}
              trailingIcon={<ArrowRight className="h-4 w-4" />}
            >
              Connect wallet
            </GlowButton>
          </motion.div>

          <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-4">
            <AvatarStack count={5} seed="echo-ai-social" />
            <p className="text-[0.8rem] leading-snug text-echo-muted">
              <AnimatedNumber value={HERO_SOCIAL_PROOF.count} className="font-semibold text-white" duration={1800} />{' '}
              people have created their AI Shadow
            </p>
          </motion.div>

          <motion.p variants={item} className="mt-5 flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-echo-faint">
            <span className="h-1 w-1 rounded-full bg-echo-cyan" />
            Public on-chain data only · Simulated results · No custody
          </motion.p>
        </motion.div>

        {/* ---------------- visual ---------------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.975 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}
