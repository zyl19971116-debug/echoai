import { cn } from '@/lib/format';

interface EchoMarkProps {
  size?: number;
  className?: string;
  gradientId?: string;
}

/**
 * Temporary ECHO AI identity mark: a core point radiating concentric echo
 * rings. Pure SVG, scales cleanly, no binary asset required.
 */
export function EchoMark({ size = 28, className, gradientId = 'echo-mark-grad' }: EchoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5C9BFF" />
          <stop offset="0.55" stopColor="#8A79FF" />
          <stop offset="1" stopColor="#B98CFF" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="2.6" fill={`url(#${gradientId})`} />
      <path
        d="M21.6 10.4a8 8 0 0 1 0 11.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M10.4 10.4a8 8 0 0 0 0 11.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M25.6 6.4a14.4 14.4 0 0 1 0 19.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M6.4 6.4a14.4 14.4 0 0 0 0 19.2"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

interface EchoLogoProps {
  className?: string;
  size?: number;
  compact?: boolean;
}

export function EchoLogo({ className, size = 26, compact = false }: EchoLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <EchoMark size={size} gradientId="echo-logo-grad" />
      {!compact && (
        <span className="text-[0.95rem] font-semibold uppercase tracking-[0.24em] text-white">
          ECHO<span className="ml-1.5 font-light text-echo-faint">AI</span>
        </span>
      )}
    </span>
  );
}
