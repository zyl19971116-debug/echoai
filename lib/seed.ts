/**
 * Deterministic pseudo-randomness.
 *
 * ECHO AI must be *stable*: the same wallet address has to produce the same
 * Shadow on every refresh, on every machine, and on the server as well as the
 * client. Everything therefore flows through a seeded generator instead of
 * `Math.random()`.
 */

/**
 * Fixed reference "now". Using a constant instead of `Date.now()` keeps
 * server-rendered markup identical to the client's first render (no hydration
 * mismatch) and keeps demo data reproducible across sessions.
 */
export const REFERENCE_DATE = '2026-10-01T00:00:00.000Z';
export const REFERENCE_MS = Date.parse(REFERENCE_DATE);
const DAY_MS = 86_400_000;

/** FNV-1a — stable 32-bit hash of any string. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  const value = input.trim();
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, well-distributed seeded PRNG. */
export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return function next(): number {
    t = (t + 0x6d2b79f5) >>> 0;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), 1 | x);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

/** Integer in [min, max] (inclusive). */
export function randomInt(rng: Rng, min: number, max: number): number {
  if (max <= min) return Math.round(min);
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Float in [min, max). */
export function randomFloat(rng: Rng, min: number, max: number): number {
  return rng() * (max - min) + min;
}

export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length) % list.length];
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, digits = 0): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** ISO date string `days` before the fixed reference date. */
export function daysAgoIso(days: number): string {
  return new Date(REFERENCE_MS - Math.max(0, days) * DAY_MS).toISOString();
}

/** Short label (`MMM D`) for chart axes. */
export function shortDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/**
 * Avalanche mix (murmur3 finalizer). FNV-1a alone leaves consecutive inputs
 * correlated, which would produce visibly patterned hex output.
 */
function mix32(input: number): number {
  let h = input >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** Deterministic lowercase hex string of `length` chars from a seed. */
export function hashHex(seed: string, length = 8): string {
  let out = '';
  let i = 0;
  while (out.length < length) {
    out += mix32(hashString(`${seed}#${i}`)).toString(16).padStart(8, '0');
    i += 1;
  }
  return out.slice(0, length);
}

/** Deterministic, syntactically valid EVM-style address derived from a seed. */
export function addressFromSeed(seed: string): string {
  return `0x${hashHex(seed, 40)}`;
}
