'use client';

/**
 * Registry of wallets that have actually completed the connect flow on this
 * device. This is the only source for the "shadows created" counter — there is
 * deliberately no seeded baseline, so the number starts at zero and can only
 * grow when a real connection happens.
 *
 * When a backend arrives, swap the body of these functions for API calls; the
 * call sites do not need to change.
 */

const STORAGE_KEY = 'echo:shadow-registry:v1';

/** Fired on `window` whenever the registry changes. */
export const SHADOW_REGISTRY_EVENT = 'echo:shadow-registry-changed';

export interface ShadowRegistryState {
  /** Lowercased addresses, unique, in the order they were connected. */
  wallets: string[];
  updatedAt: string;
}

const EMPTY: ShadowRegistryState = { wallets: [], updatedAt: '' };

function normalize(address: string): string {
  return address.trim().toLowerCase();
}

export function readShadowRegistry(): ShadowRegistryState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ShadowRegistryState>;
    if (!Array.isArray(parsed.wallets)) return EMPTY;
    return {
      wallets: parsed.wallets.filter((w): w is string => typeof w === 'string').map(normalize),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return EMPTY;
  }
}

export function countShadowWallets(): number {
  return readShadowRegistry().wallets.length;
}

/** Adds a wallet to the registry (idempotent) and notifies subscribers. */
export function recordShadowWallet(address: string): ShadowRegistryState {
  if (typeof window === 'undefined') return EMPTY;
  const id = normalize(address);
  if (!id) return readShadowRegistry();

  const current = readShadowRegistry();
  if (current.wallets.includes(id)) return current;

  const next: ShadowRegistryState = {
    wallets: [...current.wallets, id],
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — the counter degrades to the in-memory value.
  }
  window.dispatchEvent(new Event(SHADOW_REGISTRY_EVENT));
  return next;
}
