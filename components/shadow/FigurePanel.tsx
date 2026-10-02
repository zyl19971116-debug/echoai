'use client';

import { useState } from 'react';
import { cn } from '@/lib/format';
import { EchoRings } from '@/components/ui/Backdrop';
import { ParticleField } from '@/components/ui/ParticleField';

type Variant = 'human' | 'shadow';

interface FigurePanelProps {
  variant: Variant;
  label: string;
  sublabel?: string;
  sublabelTone?: 'blue' | 'violet';
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * Character container shared by the human side and the AI side.
 *
 * The image is expected at `/public/assets/echo/*`. If it is missing the
 * component degrades to a drawn silhouette instead of showing a broken-image
 * icon, so the layout never collapses.
 */
export function FigurePanel({
  variant,
  label,
  sublabel,
  sublabelTone = 'blue',
  src,
  alt,
  className,
}: FigurePanelProps) {
  const [failed, setFailed] = useState(false);
  const isShadow = variant === 'shadow';

  return (
    <div className={cn('group relative flex flex-col items-center', className)}>
      <div className="relative w-full overflow-hidden rounded-sm">
        {/* floor glow */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-[radial-gradient(60%_100%_at_50%_100%,rgba(76,141,255,0.28),transparent_72%)]',
            isShadow &&
              'bg-[radial-gradient(62%_100%_at_50%_100%,rgba(155,107,255,0.36),transparent_74%)]',
          )}
        />

        {isShadow && (
          <>
            <EchoRings className="left-1/2 top-[42%] h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2" opacity={0.42} />
            <ParticleField className="opacity-70" density={0.9} maxParticles={70} />
          </>
        )}

        <div className="relative aspect-[3/4] w-full">
          {failed ? (
            <FigureFallback isShadow={isShadow} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              onError={() => setFailed(true)}
              loading="eager"
              decoding="async"
              className={cn(
                'absolute inset-0 h-full w-full object-cover object-top',
                isShadow ? 'opacity-90' : 'opacity-85',
              )}
            />
          )}

          {/* scanline sweep — AI side only */}
          {isShadow && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scanline bg-gradient-to-b from-transparent via-echo-cyan/[0.12] to-transparent"
            />
          )}

          {/* bottom fade into the page */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-void-900 via-void-900/70 to-transparent"
          />
        </div>

        {/* holographic frame */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 rounded-sm border',
            isShadow ? 'border-echo-violet/22' : 'border-white/[0.08]',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t',
            isShadow ? 'border-echo-violet/60' : 'border-echo-blue/45',
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r',
            isShadow ? 'border-echo-violet/60' : 'border-echo-blue/45',
          )}
        />
      </div>

      {/* identity plate */}
      <div className="relative z-10 -mt-8 flex flex-col items-center gap-1.5">
        <span
          className={cn(
            'text-[0.82rem] font-semibold uppercase tracking-[0.34em]',
            isShadow ? 'text-gradient glow-text' : 'text-white/85',
          )}
        >
          {label}
        </span>
        {sublabel && (
          <span
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.2em]',
              sublabelTone === 'violet'
                ? 'border-echo-violet/35 bg-echo-violet/10 text-[#C7AEFF]'
                : 'border-echo-blue/30 bg-echo-blue/[0.08] text-[#9FC2FF]',
            )}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/** Drawn fallback silhouette — used when the expected image asset is absent. */
function FigureFallback({ isShadow }: { isShadow: boolean }) {
  return (
    <svg
      viewBox="0 0 300 400"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fig-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isShadow ? '#2A2154' : '#141C31'} />
          <stop offset="100%" stopColor="#05080F" />
        </linearGradient>
        <linearGradient id="fig-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isShadow ? '#9B6BFF' : '#4C8DFF'} />
          <stop offset="100%" stopColor={isShadow ? '#3BE8FF' : '#7A9BFF'} />
        </linearGradient>
      </defs>

      <g transform="translate(150 400)">
        <path
          d="M-104 0 C-96 -104 -52 -146 0 -146 C52 -146 96 -104 104 0 Z"
          fill="url(#fig-body)"
          stroke="url(#fig-rim)"
          strokeWidth={isShadow ? 1.4 : 0.8}
          strokeOpacity={isShadow ? 0.9 : 0.5}
          strokeDasharray={isShadow ? '4 5' : undefined}
        />
        <path
          d="M-26 -152 C-26 -132 -18 -122 0 -122 C18 -122 26 -132 26 -152 L26 -186 L-26 -186 Z"
          fill="url(#fig-body)"
          stroke="url(#fig-rim)"
          strokeWidth={isShadow ? 1.2 : 0.6}
          strokeOpacity={0.55}
        />
        <ellipse
          cx="0"
          cy="-244"
          rx="70"
          ry="86"
          fill="url(#fig-body)"
          stroke="url(#fig-rim)"
          strokeWidth={isShadow ? 1.6 : 0.9}
          strokeOpacity={isShadow ? 0.95 : 0.55}
          strokeDasharray={isShadow ? '5 6' : undefined}
        />
        {isShadow && (
          <g opacity="0.55">
            {[-300, -280, -258, -236, -214, -192, -170, -148, -126, -104, -82, -60, -38, -16].map((y) => (
              <line
                key={y}
                x1={-70}
                x2={70}
                y1={y}
                y2={y}
                stroke="#7FD9FF"
                strokeWidth="0.6"
                strokeOpacity="0.35"
              />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
