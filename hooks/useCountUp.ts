'use client';

import { useEffect, useRef, useState } from 'react';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

interface CountUpOptions {
  duration?: number;
  decimals?: number;
  /** start animating only when true (e.g. when scrolled into view) */
  enabled?: boolean;
}

/**
 * rAF counter. Returns 0 during SSR and on the first client render so the
 * markup always matches, then animates once mounted.
 */
export function useCountUp(target: number, options: CountUpOptions = {}): number {
  const { duration = 1400, decimals = 0, enabled = true } = options;
  const [value, setValue] = useState(0);
  const frame = useRef<number | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled || started.current) return;

    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      started.current = true;
      setValue(target);
      return;
    }

    started.current = true;
    const start = performance.now();
    const factor = 10 ** decimals;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = Math.round(target * easeOutCubic(progress) * factor) / factor;
      setValue(next);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [target, duration, decimals, enabled]);

  return value;
}

/** Fires once when the element enters the viewport. */
export function useInViewOnce<T extends HTMLElement>(rootMargin = '0px 0px -12% 0px') {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

/** Window scroll offset (throttled to animation frames). */
export function useScrollY(threshold = 0): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setPast(window.scrollY > threshold);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [threshold]);

  return past;
}
