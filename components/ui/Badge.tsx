import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

type Tone = 'blue' | 'violet' | 'cyan' | 'neutral' | 'simulation' | 'warning';

const TONES: Record<Tone, string> = {
  blue: 'border-echo-blue/35 bg-echo-blue/10 text-[#9FC2FF]',
  violet: 'border-echo-violet/35 bg-echo-violet/10 text-[#C7AEFF]',
  cyan: 'border-echo-cyan/35 bg-echo-cyan/10 text-[#9BEBFF]',
  neutral: 'border-white/12 bg-white/[0.04] text-echo-muted',
  simulation: 'border-echo-violet/30 bg-echo-violet/[0.08] text-[#BFA8FF]',
  warning: 'border-[#FF9C7A]/35 bg-[#FF9C7A]/10 text-[#FFBF9F]',
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}

export function Badge({ children, tone = 'neutral', className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** The mandatory "these numbers are simulated" marker. */
export function SimulationBadge({ className }: { className?: string }) {
  return (
    <Badge tone="simulation" className={className}>
      Simulation
    </Badge>
  );
}
