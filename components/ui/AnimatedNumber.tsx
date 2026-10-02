'use client';

import { cn, formatNumber, formatUsd } from '@/lib/format';
import { useCountUp, useInViewOnce } from '@/hooks/useCountUp';

interface AnimatedNumberProps {
  value: number;
  /** rendering style */
  format?: 'number' | 'usd' | 'compact-usd' | 'percent';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

function render(value: number, format: AnimatedNumberProps['format'], decimals: number): string {
  switch (format) {
    case 'usd':
      return formatUsd(value, { decimals });
    case 'compact-usd':
      return formatUsd(value, { compact: true });
    case 'percent':
      return `${value.toFixed(decimals)}%`;
    default:
      return formatNumber(value, decimals);
  }
}

/**
 * Counts up to `value` the first time it scrolls into view. Renders the zero
 * state on the server so hydration always matches.
 */
export function AnimatedNumber({
  value,
  format = 'number',
  decimals = 0,
  prefix = '',
  suffix = '',
  duration,
  className,
}: AnimatedNumberProps) {
  const { ref, inView } = useInViewOnce<HTMLSpanElement>();
  const current = useCountUp(value, { decimals, enabled: inView, duration });

  return (
    <span ref={ref} className={cn('tabular', className)}>
      {prefix}
      {render(current, format, decimals)}
      {suffix}
    </span>
  );
}
