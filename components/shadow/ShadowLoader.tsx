'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/format';
import { EchoMark } from '@/components/ui/EchoLogo';

export const SHADOW_STEPS = [
  { key: 'scan', label: 'SCANNING WALLET', detail: 'Resolving public address activity' },
  { key: 'history', label: 'READING HISTORY', detail: 'Transactions, protocols, holding windows' },
  { key: 'behaviour', label: 'MAPPING BEHAVIOR', detail: 'Risk · patience · timing · diversification' },
  { key: 'shadow', label: 'CREATING SHADOW', detail: 'Replaying history with alternative decisions' },
  { key: 'ready', label: 'YOUR ECHO IS READY', detail: 'Opening your AI Shadow' },
] as const;

interface ShadowLoaderProps {
  address?: string | null;
  /** ms per step — 5 steps × 760ms ≈ 3.8s total */
  stepDuration?: number;
  onComplete?: () => void;
  className?: string;
  overlay?: boolean;
}

/**
 * The connect → Shadow sequence. Always walks the same five steps so the
 * experience is predictable, and always tells the user what is happening
 * rather than showing a bare spinner.
 */
export function ShadowLoader({
  address,
  stepDuration = 760,
  onComplete,
  className,
  overlay = true,
}: ShadowLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= SHADOW_STEPS.length) return;
    const timer = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, stepDuration);
    return () => clearTimeout(timer);
  }, [index, stepDuration]);

  useEffect(() => {
    if (index >= SHADOW_STEPS.length && onComplete) {
      const timer = setTimeout(onComplete, 520);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [index, onComplete]);

  const progress = useMemo(
    () => Math.min(100, Math.round((index / SHADOW_STEPS.length) * 100)),
    [index],
  );

  const body = (
    <div className={cn('relative w-full max-w-[560px] px-6', className)}>
      {/* core */}
      <div className="relative mx-auto mb-10 flex h-[132px] w-[132px] items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full border border-echo-violet/25"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-4 rounded-full border border-dashed border-echo-blue/35"
          animate={{ rotate: -360 }}
          transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(120,90,255,0.45),transparent_66%)]"
          animate={{ opacity: [0.4, 0.95, 0.4], scale: [0.94, 1.06, 0.94] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <EchoMark size={46} gradientId="echo-loader-grad" className="relative z-10" />
      </div>

      <div className="mb-7 text-center">
        <p className="kicker mb-2">Building AI Shadow</p>
        <p className="mono text-[0.72rem] text-echo-muted">{address ?? 'connected wallet'}</p>
      </div>

      {/* steps */}
      <ul className="flex flex-col gap-2.5">
        {SHADOW_STEPS.map((step, stepIndex) => {
          const state = stepIndex < index ? 'done' : stepIndex === index ? 'active' : 'idle';
          return (
            <li
              key={step.key}
              className={cn(
                'flex items-center gap-3 border-l px-4 py-2.5 transition-colors duration-500',
                state === 'done' && 'border-echo-cyan/45 bg-white/[0.02]',
                state === 'active' && 'border-echo-violet/60 bg-echo-violet/[0.05]',
                state === 'idle' && 'border-white/[0.07]',
              )}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {state === 'done' ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.28 }}
                    >
                      <Check className="h-3.5 w-3.5 text-echo-cyan" />
                    </motion.span>
                  ) : state === 'active' ? (
                    <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-echo-violet" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      className="h-1 w-1 rounded-full bg-white/25"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </AnimatePresence>
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block text-[0.72rem] font-semibold uppercase tracking-[0.2em]',
                    state === 'idle' ? 'text-echo-faint' : 'text-white',
                  )}
                >
                  {step.label}
                </span>
                <span className="mt-0.5 block text-[0.68rem] text-echo-faint">{step.detail}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {/* progress */}
      <div className="mt-7">
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            className="h-full bg-echo-gradient"
            animate={{ width: `${Math.max(6, progress)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="mono text-[0.62rem] text-echo-faint">{progress}%</span>
          <span className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-echo-faint">
            <Sparkles className="h-3 w-3" />
            Simulated · not financial advice
          </span>
        </div>
      </div>
    </div>
  );

  if (!overlay) {
    return <div className="flex w-full justify-center py-12">{body}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-void-900/94 backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-lines opacity-60 mask-fade-b"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_400px_at_50%_40%,rgba(110,90,255,0.18),transparent_70%)]"
      />
      {body}
    </motion.div>
  );
}
