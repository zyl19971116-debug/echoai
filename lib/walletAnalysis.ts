import type { ApiErrorCode, WalletProfile } from '@/types';
import { clamp, createRng, daysAgoIso, hashString, randomFloat, randomInt, roundTo } from './seed';
import { resolveArchetype } from './archetypes';

export const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

/**
 * Addresses starting with four zero nibbles are treated as "empty" demo
 * wallets. This makes the empty-state path reachable in the UI without ever
 * colliding with a realistic address.
 */
const EMPTY_ADDRESS_PREFIX = '0x0000';

export class WalletError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
  }
}

export function isValidAddress(address: string): boolean {
  return ADDRESS_PATTERN.test((address ?? '').trim());
}

export function isDemoEmptyWallet(address: string): boolean {
  return (address ?? '').trim().toLowerCase().startsWith(EMPTY_ADDRESS_PREFIX);
}

export function shortAddress(address: string, lead = 4, tail = 3): string {
  if (!address) return '';
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, lead + 2)}...${address.slice(-tail)}`;
}

/**
 * Deterministic wallet analyser.
 *
 * The mock numbers are derived from a hash of the address — no network calls,
 * no `Math.random()`, so the same wallet always produces the same profile on
 * every refresh, on every machine, on the server as well as the client.
 *
 * The signature deliberately matches what a real indexer integration would
 * need: replacing the body with a fetch to `/api/wallet/[address]` requires no
 * UI changes.
 */
export function analyzeWallet(address: string): WalletProfile {
  const normalized = (address ?? '').trim();

  if (!isValidAddress(normalized)) {
    throw new WalletError(
      'invalid_address',
      'That does not look like a wallet address. Expected 42 characters starting with 0x.',
    );
  }

  if (isDemoEmptyWallet(normalized)) {
    return emptyProfile(normalized);
  }

  const seed = hashString(normalized.toLowerCase());
  const rng = createRng(seed);

  /* --- raw public on-chain footprint ------------------------------------
     Order of rng() consumption is part of the seed: changing it changes every
     profile in the demo world, so it is deliberately stable. */
  const walletAge = randomInt(rng, 220, 1640);
  /** share of the wallet's lifetime with at least one transaction */
  const consistency = randomFloat(rng, 0.18, 0.88);
  const activeDays = Math.max(5, Math.round(walletAge * consistency));
  /** transactions per active day — kept inside a believable 0.6 - 13 range */
  const tradingFrequency = roundTo(randomFloat(rng, 0.6, 13), 2);
  const transactions = Math.max(12, Math.round(activeDays * tradingFrequency));
  const protocols = randomInt(rng, 7, 134);
  const nftCount = rng() > 0.34 ? randomInt(rng, 3, 428) : 0;

  /* --- behavioural scores ------------------------------------------------ */
  const activityScore = clamp(
    Math.round(consistency * 70 + Math.min(tradingFrequency / 10, 1) * 30),
  );

  const riskScore = clamp(
    Math.round(
      (tradingFrequency / 13) * 58 +
        (nftCount > 0 ? 7 : 0) +
        (1 - consistency) * 15 +
        rng() * 17,
    ),
  );

  const diversityScore = clamp(Math.round(((protocols - 7) / 127) * 72 + rng() * 28));

  const holdingScore = clamp(
    Math.round(
      96 - tradingFrequency * 5.4 + consistency * 12 + rng() * 12 - (nftCount > 200 ? 8 : 0),
    ),
  );

  const archetype = resolveArchetype({
    riskScore,
    activityScore,
    diversityScore,
    holdingScore,
  });

  const dormantDays = randomInt(rng, 0, Math.max(1, Math.round(walletAge * 0.08)));

  return {
    address: normalized,
    walletAge,
    transactions,
    activeDays,
    protocols,
    nftCount,
    riskScore,
    activityScore,
    diversityScore,
    holdingScore,
    tradingFrequency,
    archetype,
    firstSeen: daysAgoIso(walletAge),
    lastActive: daysAgoIso(dormantDays),
    isEmpty: false,
  };
}

/** Zeroed profile used for wallets with no usable public history. */
export function emptyProfile(address: string): WalletProfile {
  return {
    address,
    walletAge: 0,
    transactions: 0,
    activeDays: 0,
    protocols: 0,
    nftCount: 0,
    riskScore: 0,
    activityScore: 0,
    diversityScore: 0,
    holdingScore: 0,
    tradingFrequency: 0,
    archetype: 'THE NOMAD',
    firstSeen: daysAgoIso(0),
    lastActive: daysAgoIso(0),
    isEmpty: true,
  };
}

/** Never throws — returns a normalised error instead (used by the API layer). */
export function safeAnalyzeWallet(
  address: string,
): { ok: true; profile: WalletProfile } | { ok: false; code: ApiErrorCode; message: string } {
  try {
    return { ok: true, profile: analyzeWallet(address) };
  } catch (error) {
    if (error instanceof WalletError) {
      return { ok: false, code: error.code, message: error.message };
    }
    return {
      ok: false,
      code: 'analysis_failed',
      message: 'Wallet analysis failed. Please try again in a moment.',
    };
  }
}

/** Human-readable label for a wallet's footprint size. */
export function describeFootprint(profile: WalletProfile): string {
  if (profile.isEmpty) return 'No public history';
  if (profile.transactions > 5000) return 'Heavy on-chain footprint';
  if (profile.transactions > 1200) return 'Established on-chain footprint';
  if (profile.transactions > 400) return 'Moderate on-chain footprint';
  return 'Light on-chain footprint';
}
