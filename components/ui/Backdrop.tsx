import { cn } from '@/lib/format';

/**
 * Page background: near-black base, faint technical grid, two soft radial
 * glows and a top vignette. Deliberately quiet — the interface stays ~90%
 * dark and the glow is never allowed to wash out the data.
 */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <div className="absolute inset-0 bg-void-900" />
      <div className="absolute inset-0 bg-[radial-gradient(1400px_720px_at_18%_-10%,rgba(60,110,255,0.14),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(1100px_620px_at_88%_8%,rgba(140,90,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 grid-lines opacity-[0.85] mask-fade-b" />
      <div className="absolute inset-x-0 top-0 h-[380px] vignette" />
    </div>
  );
}

/** Horizontal light beam used to separate sections. */
export function BeamLine({ className }: { className?: string }) {
  return <div className={cn('divider-glow w-full', className)} aria-hidden="true" />;
}

/**
 * Faint concentric rings — used behind the Shadow portrait to suggest a
 * containment field rather than decoration.
 */
export function EchoRings({ className, opacity = 0.35 }: { className?: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={cn('pointer-events-none absolute', className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="echo-rings-grad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4C8DFF" />
          <stop offset="1" stopColor="#9B6BFF" />
        </linearGradient>
      </defs>
      {[60, 92, 128, 168].map((r, i) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          fill="none"
          stroke="url(#echo-rings-grad)"
          strokeWidth={i === 0 ? 1.1 : 0.7}
          strokeDasharray={i % 2 === 0 ? '1 7' : undefined}
          opacity={1 - i * 0.2}
        />
      ))}
    </svg>
  );
}
