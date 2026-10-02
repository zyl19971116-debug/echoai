'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/format';

interface ParticleFieldProps {
  className?: string;
  /** particles per 100 000 px² */
  density?: number;
  color?: string;
  secondaryColor?: string;
  maxParticles?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  tint: number;
}

/**
 * Very subtle drifting particles on a canvas. Canvas (not DOM nodes) so a few
 * hundred points cost nothing, and the whole layer is skipped when the user
 * prefers reduced motion.
 */
export function ParticleField({
  className,
  density = 0.6,
  color = '76, 141, 255',
  secondaryColor = '155, 107, 255',
  maxParticles = 110,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let running = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(maxParticles, Math.round((width * height) / 100_000 * density * 10));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.05 - Math.random() * 0.16,
        r: 0.5 + Math.random() * 1.5,
        a: 0.08 + Math.random() * 0.32,
        tint: Math.random(),
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -8) {
          p.y = height + 6;
          p.x = Math.random() * width;
        }
        if (p.x < -8) p.x = width + 6;
        if (p.x > width + 8) p.x = -6;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.tint > 0.55 ? secondaryColor : color}, ${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (running) frame = requestAnimationFrame(draw);
    };

    build();
    frame = requestAnimationFrame(draw);

    const observer = new ResizeObserver(() => build());
    observer.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [density, color, secondaryColor, maxParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden="true"
    />
  );
}
