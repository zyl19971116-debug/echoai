import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/format';

type Variant = 'primary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface GlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  fullWidth?: boolean;
  'aria-label'?: string;
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.68rem]',
  md: 'h-11 px-5 text-[0.72rem]',
  lg: 'h-[3.25rem] px-7 text-[0.76rem]',
};

const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary text-white',
  ghost: 'btn-ghost',
};

/**
 * The single button primitive. Renders a `next/link` when `href` is supplied
 * so navigation stays client-side, and a real `<button>` otherwise.
 */
export function GlowButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  trailingIcon,
  type = 'button',
  disabled = false,
  fullWidth = false,
  ...rest
}: GlowButtonProps) {
  const classes = cn(
    'btn group relative isolate overflow-hidden rounded-sm',
    SIZES[size],
    VARIANTS[variant],
    fullWidth && 'w-full',
    disabled && 'pointer-events-none opacity-50',
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition-transform duration-700 ease-echo group-hover:translate-x-full"
      />
      {icon && <span className="relative shrink-0">{icon}</span>}
      <span className="relative">{children}</span>
      {trailingIcon && (
        <span className="relative shrink-0 transition-transform duration-300 ease-echo group-hover:translate-x-0.5">
          {trailingIcon}
        </span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} aria-label={rest['aria-label']}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={rest['aria-label']}>
      {inner}
    </button>
  );
}
