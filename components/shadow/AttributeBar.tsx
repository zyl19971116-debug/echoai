'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/format';

const ACCENTS: Record<string, string> = {
  blue: 'linear-gradient(90deg, #2B5FC7 0%, #4C8DFF 100%)',
  violet: 'linear-gradient(90deg, #5B3EC7 0%, #9B6BFF 100%)',
  cyan: 'linear-gradient(90deg, #1F8CA8 0%, #3BE8FF 100%)',
};

interface AttributeBarProps {
  label: string;
  value: number;
  blurb?: string;
  accent?: keyof typeof ACCENTS;
  delay?: number;
  compare?: number;
  compareLabel?: string;
  className?: string;
}

/**
 * One attribute of the decision model. The numeric value is always shown —
 * the bar is a helper, never the only carrier of the information.
 */
export function AttributeBar({
  label,
  value,
  blurb,
  accent = 'violet',
  delay = 0,
  compare,
  compareLabel = 'human',
  className,
}: AttributeBarProps) {
  return (
    <div className={cn('group', className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-echo-muted">{label}</span>
        <span className="tabular text-[0.98rem] font-semibold text-white">{Math.round(value)}</span>
      </div>

      <div className="relative mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundImage: ACCENTS[accent] ?? ACCENTS.violet }}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(2, Math.min(100, value))}%` }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-10 opacity-70 blur-[6px]"
          style={{
            left: `calc(${Math.max(2, Math.min(100, value))}% - 2.5rem)`,
            backgroundImage: ACCENTS[accent] ?? ACCENTS.violet,
          }}
        />
        {typeof compare === 'number' && (
          <span
            aria-hidden="true"
            title={`${compareLabel}: ${Math.round(compare)}`}
            className="absolute -top-[3px] h-[9px] w-px bg-white/45"
            style={{ left: `${Math.max(1, Math.min(99, compare))}%` }}
          />
        )}
      </div>

      {blurb && <p className="mt-2 text-[0.68rem] leading-relaxed text-echo-faint">{blurb}</p>}
    </div>
  );
}
