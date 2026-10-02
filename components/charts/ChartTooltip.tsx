'use client';

import { cn } from '@/lib/format';

export interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
  stroke?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter?: (value: number) => string;
  labelFormatter?: (label: string | number) => string;
  seriesNames?: Record<string, string>;
  className?: string;
}

const DEFAULT_DOT: Record<string, string> = {
  human: '#4C8DFF',
  ai: '#9B6BFF',
  left: '#4C8DFF',
  right: '#9B6BFF',
  compare: '#3BE8FF',
  value: '#4C8DFF',
};

/** Shared dark tooltip so every chart in the product reads the same way. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  seriesNames,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className={cn('glass-flat min-w-[150px] rounded-sm px-3 py-2.5 shadow-glow', className)}>
      {label !== undefined && (
        <p className="mb-2 border-b border-white/[0.07] pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-echo-faint">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {payload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? 'value');
          const numeric = typeof entry.value === 'number' ? entry.value : Number(entry.value ?? 0);
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.14em] text-echo-muted">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: seriesNames?.[key] ? DEFAULT_DOT[key] ?? '#4C8DFF' : DEFAULT_DOT[key] ?? entry.color ?? '#4C8DFF' }}
                />
                {seriesNames?.[key] ?? String(entry.name ?? key).toUpperCase()}
              </span>
              <span className="tabular text-[0.75rem] font-semibold text-white">
                {formatter ? formatter(numeric) : numeric.toLocaleString('en-US')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
