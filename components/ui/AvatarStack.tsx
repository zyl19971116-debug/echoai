import { cn } from '@/lib/format';

interface AvatarStackProps {
  /** 0..1 */
  count?: number;
  className?: string;
  seed?: string;
}

const GRADIENTS = [
  'from-[#3E6FE0] to-[#7A5CFF]',
  'from-[#2E8FB8] to-[#4C8DFF]',
  'from-[#6C42D6] to-[#B07CFF]',
  'from-[#2B6BB8] to-[#3BE8FF]',
  'from-[#4C4CD6] to-[#9B6BFF]',
];

/** Deterministic identity dots — no image assets required. */
export function AvatarStack({ count = 5, className, seed = 'echo' }: AvatarStackProps) {
  const avatars = Array.from({ length: count }, (_, index) => {
    const code = seed.charCodeAt(index % seed.length) + index * 37;
    return {
      gradient: GRADIENTS[code % GRADIENTS.length],
      offset: (code % 7) - 3,
    };
  });

  return (
    <div className={cn('flex items-center', className)} aria-hidden="true">
      {avatars.map((avatar, index) => (
        <span
          key={index}
          className={cn(
            'relative -ml-2 h-8 w-8 rounded-full border border-white/12 bg-gradient-to-br first:ml-0',
            avatar.gradient,
          )}
          style={{ zIndex: avatars.length - index, top: avatar.offset / 2 }}
        >
          <span className="absolute inset-[3px] rounded-full bg-void-800/55 backdrop-blur-[1px]" />
          <span className="absolute inset-0 flex items-center justify-center text-[0.55rem] font-semibold text-white/80">
            {String.fromCharCode(65 + ((index * 5) % 26))}
          </span>
        </span>
      ))}
    </div>
  );
}
