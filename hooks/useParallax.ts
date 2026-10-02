'use client';

import { useCallback, useRef } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';

interface PointerParallax {
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/**
 * Subtle pointer parallax. Values are normalised to -1..1 around the pointer
 * position inside the element, then spring-smoothed so the motion stays
 * expensive-looking rather than twitchy.
 */
export function usePointerParallax(strength = 1): PointerParallax {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 90, damping: 22, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 90, damping: 22, mass: 0.6 });
  const node = useRef<HTMLElement | null>(null);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      node.current = event.currentTarget;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rawX.set(px * 2 * strength);
      rawY.set(py * 2 * strength);
    },
    [rawX, rawY, strength],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, onPointerMove, onPointerLeave };
}
