import type { Archetype, PortfolioPoint, TimelineEvent } from '@/types';
import { addressFromSeed } from '@/lib/seed';
import { analyzeWallet } from '@/lib/walletAnalysis';
import { SIMULATION_START_VALUE, buildPortfolioSeries, generateShadow, simulateBattle } from '@/lib/shadowEngine';

/* ------------------------------------------------------------------ */
/* Demo wallet                                                         */
/* ------------------------------------------------------------------ */

/**
 * The wallet used by DEMO MODE — no extension, no signature, no custody.
 *
 * The body of this address was selected so that the deterministic analyser
 * derives the showcase profile from the reference design (THE HUNTER, high
 * risk / activity / timing, low patience). Change it and the demo profile
 * changes with it — that is the point of the seeded engine.
 */
export const DEMO_WALLET = '0x71F88e872356102f740fed1946e7ac4730a2A92C';

/** Example address shown as the second battle player placeholder. */
export const BATTLE_EXAMPLE_WALLET = '0x4A9eC1b7F30d82E6a5B1c94D7e0F3aB6c81d5E42';

const CODENAMES = [
  'ORION',
  'VESPER',
  'NOVA',
  'KITE',
  'ONYX',
  'HALO',
  'RIFT',
  'ZENO',
  'LUMA',
  'CIPHER',
  'ATLAS',
  'PYRE',
  'AERO',
  'MIRA',
  'QUILL',
  'VOLT',
  'SABLE',
  'NYX',
  'DELTA',
  'ECHO9',
] as const;

/**
 * 20 deterministic demo wallets. Addresses are hashes of the codename, so the
 * whole world is reproducible on every refresh and on the server too.
 */
export const DEMO_WALLETS: { name: string; address: string }[] = CODENAMES.map((name) => ({
  name,
  address: addressFromSeed(`echo:demo:${name}`),
}));

export const DEMO_ADDRESSES: string[] = DEMO_WALLETS.map((w) => w.address);

/* ------------------------------------------------------------------ */
/* Portfolio histories                                                 */
/* ------------------------------------------------------------------ */

function portfolioFor(address: string, days: number): PortfolioPoint[] {
  const profile = analyzeWallet(address);
  const shadow = generateShadow(profile);
  return buildPortfolioSeries(profile, shadow, days);
}

/** Full 1-year curve for the demo wallet — sliced by the UI range filters. */
export const DEMO_PORTFOLIO: PortfolioPoint[] = portfolioFor(DEMO_WALLET, 365);

/** Short 30-day curve used inside the "PARALLEL TIMELINE" home card. */
export const PREVIEW_PORTFOLIO: PortfolioPoint[] = portfolioFor(DEMO_WALLET, 30);

export const DEMO_PROFILE = analyzeWallet(DEMO_WALLET);
export const DEMO_SHADOW = generateShadow(DEMO_PROFILE);

export { portfolioFor };

/* ------------------------------------------------------------------ */
/* Timeline events                                                     */
/* ------------------------------------------------------------------ */

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    day: 1,
    humanAction: 'Held ETH. No changes to the core position.',
    aiAction: 'Reduced ETH exposure by 40% and rotated into stables.',
    verdict: 'AI',
  },
  {
    day: 7,
    humanAction: 'Bought TOKEN A after a three-day run.',
    aiAction: 'Skipped. Entry quality scored below threshold.',
    verdict: 'AI',
  },
  {
    day: 12,
    humanAction: 'Deposited into a new LRT vault.',
    aiAction: 'Waited for the audit window, then entered at half size.',
    verdict: 'EVEN',
  },
  {
    day: 18,
    humanAction: 'Sold TOKEN B into strength.',
    aiAction: 'Held the full position. Momentum model still positive.',
    verdict: 'HUMAN',
  },
  {
    day: 24,
    humanAction: 'Rebalanced manually across two ecosystems.',
    aiAction: 'Rebalanced inside a fixed risk budget.',
    verdict: 'AI',
  },
  {
    day: 30,
    humanAction: 'Sat on hands.',
    aiAction: 'Trimmed the weakest leg, added to the strongest.',
    verdict: 'AI',
  },
];

/* ------------------------------------------------------------------ */
/* Battle examples                                                     */
/* ------------------------------------------------------------------ */

export const BATTLE_EXAMPLE: { one: string; two: string } = {
  one: DEMO_WALLET,
  two: DEMO_ADDRESSES[1],
};

export const BATTLE_SHOWCASE = simulateBattle(
  analyzeWallet(DEMO_WALLET),
  analyzeWallet(DEMO_ADDRESSES[4]),
  30,
);

export const BATTLE_TIME_OPTIONS = [7, 30, 90] as const;

/* ------------------------------------------------------------------ */
/* Home hero / feature card sample data                                */
/* ------------------------------------------------------------------ */

export const HERO_STATS = [
  { label: 'Transactions', value: '4,821' },
  { label: 'NFTs', value: '132' },
  { label: 'Protocols', value: '48' },
  { label: 'Active Days', value: '842' },
];

export const HERO_PREVIEW = {
  humanValue: 3820,
  aiValue: 47291,
  days: 30,
};

export const SHADOW_SAMPLE_ATTRIBUTES: { label: string; value: number }[] = [
  { label: 'RISK', value: 82 },
  { label: 'PATIENCE', value: 41 },
  { label: 'TIMING', value: 88 },
  { label: 'DIVERSIFICATION', value: 55 },
  { label: 'ACTIVITY', value: 91 },
];

export const ARCHETYPE_SAMPLES: Archetype[] = [
  'THE HUNTER',
  'THE BUILDER',
  'THE WHALE',
  'THE EXPLORER',
  'THE DEGEN',
  'THE GUARDIAN',
  'THE NOMAD',
];

export const START_VALUE_LABEL = `$${SIMULATION_START_VALUE.toLocaleString('en-US')}`;
