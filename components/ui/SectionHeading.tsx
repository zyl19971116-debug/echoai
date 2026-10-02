import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

interface SectionHeadingProps {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  actions?: ReactNode;
  className?: string;
}

export function SectionHeading({
  kicker,
  title,
  description,
  align = 'left',
  actions,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5',
        align === 'center' ? 'items-center text-center' : 'items-start',
        actions && 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {kicker && (
          <div className={cn('mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}>
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-echo-blue/70" />
            <span className="kicker">{kicker}</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-echo-violet/60" />
          </div>
        )}
        <h2 className="display text-[2rem] uppercase text-white md:text-[2.6rem] lg:text-[3.1rem]">{title}</h2>
        {description && (
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-echo-muted">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
