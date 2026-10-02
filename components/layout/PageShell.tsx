import type { ReactNode } from 'react';
import { cn } from '@/lib/format';

/**
 * Standard page container. Compensates for the fixed header (which grows by
 * the 30px status strip on large screens) and keeps the horizontal rhythm
 * consistent across every route.
 */
export function PageShell({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <main className={cn('relative pt-[70px]', className)}>
      <div className={cn('relative mx-auto w-full', wide ? 'max-w-wide' : 'shell')}>{children}</div>
    </main>
  );
}
