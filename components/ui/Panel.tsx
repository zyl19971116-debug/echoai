import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

interface PanelProps {
  children: ReactNode;
  className?: string;
  /** thin bright corner ticks */
  frame?: boolean;
  /** soft outer glow — reserve for AI-relevant content */
  glow?: boolean;
  variant?: 'glass' | 'flat';
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Panel({
  children,
  className,
  frame = false,
  glow = false,
  variant = 'glass',
  as: Tag = 'div',
}: PanelProps) {
  return (
    <Tag
      className={cn(
        'relative rounded-sm',
        variant === 'glass' ? 'glass' : 'glass-flat',
        frame && 'corner-frame',
        glow && 'shadow-glow',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  label,
  meta,
  className,
}: {
  label: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3.5', className)}>
      <span className="kicker">{label}</span>
      {meta}
    </div>
  );
}

/** Small mono label used above data values. */
export function DataLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('text-[0.6rem] font-medium uppercase tracking-[0.22em] text-echo-faint', className)}>
      {children}
    </span>
  );
}
