import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/format';

interface DeltaProps {
  value: number;
  className?: string;
  size?: 'sm' | 'md';
}

/** Green = down, red = up is *not* used here: this is a growth metric, so
 *  positive is rendered in the accent colour rather than a market colour. */
export function Delta({ value, className, size = 'md' }: DeltaProps) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold tabular',
        positive ? 'text-echo-cyan' : 'text-[#FF9C7A]',
        size === 'sm' ? 'text-[0.7rem]' : 'text-[0.82rem]',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {positive ? '+' : '−'}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

interface DataStatProps {
  label: string;
  value: ReactNode;
  delta?: number;
  note?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  accent?: boolean;
}

export function DataStat({ label, value, delta, note, className, size = 'md', accent = false }: DataStatProps) {
  const valueSize =
    size === 'lg' ? 'text-[2.4rem] md:text-[3rem]' : size === 'sm' ? 'text-[1.15rem]' : 'text-[1.65rem]';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <span className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-echo-faint">{label}</span>
      <span
        className={cn(
          'display tabular',
          valueSize,
          accent ? 'text-gradient glow-text' : 'text-white',
        )}
      >
        {value}
      </span>
      <div className="flex items-center gap-2.5">
        {typeof delta === 'number' && <Delta value={delta} size="sm" />}
        {note && <span className="text-[0.7rem] text-echo-faint">{note}</span>}
      </div>
    </div>
  );
}
