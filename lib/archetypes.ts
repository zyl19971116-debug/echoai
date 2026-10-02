import type { Archetype, ArchetypeMeta, ShadowAttributes } from '@/types';

export const ARCHETYPE_META: Record<Archetype, ArchetypeMeta> = {
  'THE HUNTER': {
    id: 'THE HUNTER',
    tagline: 'First in, first out.',
    description:
      'Moves into emerging assets early, rotates positions quickly and touches new protocols long before the market catches up.',
    accent: 'violet',
  },
  'THE BUILDER': {
    id: 'THE BUILDER',
    tagline: 'Compounds quietly.',
    description:
      'Spreads activity across a wide protocol surface, keeps positions for long horizons and lets infrastructure do the work.',
    accent: 'blue',
  },
  'THE WHALE': {
    id: 'THE WHALE',
    tagline: 'Size changes the game.',
    description:
      'Low transaction count, high conviction. When this wallet moves, liquidity notices — and it rarely moves twice.',
    accent: 'cyan',
  },
  'THE EXPLORER': {
    id: 'THE EXPLORER',
    tagline: 'Every chain is a map.',
    description:
      'Constant protocol discovery across ecosystems. Breadth over depth, always testing what was deployed last week.',
    accent: 'blue',
  },
  'THE DEGEN': {
    id: 'THE DEGEN',
    tagline: 'Maximum variance.',
    description:
      'High risk tolerance, short holding windows, aggressive sizing. Volatility is not a bug in this behaviour model.',
    accent: 'violet',
  },
  'THE GUARDIAN': {
    id: 'THE GUARDIAN',
    tagline: 'Capital preservation first.',
    description:
      'Conservative exposure, long holding periods and a deliberate avoidance of unproven contracts.',
    accent: 'cyan',
  },
  'THE NOMAD': {
    id: 'THE NOMAD',
    tagline: 'Never settles.',
    description:
      'Irregular activity with wide migration between ecosystems. Long dormancy interrupted by bursts of movement.',
    accent: 'blue',
  },
};

export const ARCHETYPE_ACCENT_HEX: Record<Archetype, string> = {
  'THE HUNTER': '#9B6BFF',
  'THE BUILDER': '#4C8DFF',
  'THE WHALE': '#3BE8FF',
  'THE EXPLORER': '#5FA8FF',
  'THE DEGEN': '#B07CFF',
  'THE GUARDIAN': '#46D8E8',
  'THE NOMAD': '#6E8BFF',
};

export function archetypeMeta(archetype: Archetype): ArchetypeMeta {
  return ARCHETYPE_META[archetype] ?? ARCHETYPE_META['THE EXPLORER'];
}

/* ------------------------------------------------------------------ */
/* Archetype resolution                                                */
/* ------------------------------------------------------------------ */

type Centroid = Record<string, number>;

interface ArchetypeCentroid {
  archetype: Archetype;
  centroid: Centroid;
}

/**
 * Nearest-centroid classification instead of a decision cascade.
 *
 * A cascade needs an arbitrary `else` branch, which silently dumps every
 * unmatched wallet into one archetype. Measuring the distance to each
 * archetype's ideal behaviour profile keeps the label explainable ("closest
 * behavioural model"), needs no fallback, and spreads the demo world across
 * the full taxonomy.
 *
 * `values` is typed as `object` because the two call sites pass different
 * interfaces (`WalletProfile` scores and `ShadowAttributes`); only the keys
 * declared on a centroid are ever read.
 */
function nearestArchetype(values: object, table: ArchetypeCentroid[], weights?: Centroid): Archetype {
  const bag = values as Centroid;
  let best = table[0].archetype;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const { archetype, centroid } of table) {
    let sum = 0;
    for (const key of Object.keys(centroid)) {
      const diff = (bag[key] ?? 0) - centroid[key];
      sum += diff * diff * (weights?.[key] ?? 1);
    }
    if (sum < bestScore) {
      bestScore = sum;
      best = archetype;
    }
  }

  return best;
}

/**
 * Human behaviour space: what the wallet actually did.
 * Dimensions — risk appetite, protocol breadth, holding behaviour, activity.
 */
const HUMAN_CENTROIDS: ArchetypeCentroid[] = [
  { archetype: 'THE HUNTER', centroid: { riskScore: 78, diversityScore: 55, holdingScore: 42, activityScore: 82 } },
  { archetype: 'THE BUILDER', centroid: { riskScore: 52, diversityScore: 84, holdingScore: 74, activityScore: 60 } },
  { archetype: 'THE WHALE', centroid: { riskScore: 55, diversityScore: 35, holdingScore: 80, activityScore: 40 } },
  { archetype: 'THE EXPLORER', centroid: { riskScore: 62, diversityScore: 82, holdingScore: 50, activityScore: 66 } },
  { archetype: 'THE DEGEN', centroid: { riskScore: 88, diversityScore: 42, holdingScore: 28, activityScore: 84 } },
  { archetype: 'THE GUARDIAN', centroid: { riskScore: 34, diversityScore: 52, holdingScore: 86, activityScore: 42 } },
  { archetype: 'THE NOMAD', centroid: { riskScore: 58, diversityScore: 44, holdingScore: 52, activityScore: 32 } },
];

/**
 * Shadow decision space: how the counterpart *decides*.
 * Dimensions — risk, timing, aggression, diversification, patience, activity.
 *
 * A Shadow always inherits a timing boost from the engine, which is why
 * Guardian-style Shadows are rare: a counterpart that simply does nothing is
 * not an interesting experiment. That asymmetry is intentional.
 */
const SHADOW_CENTROIDS: ArchetypeCentroid[] = [
  { archetype: 'THE HUNTER', centroid: { risk: 82, timing: 90, aggression: 82, diversification: 62, patience: 36, activity: 86 } },
  { archetype: 'THE BUILDER', centroid: { risk: 50, timing: 80, aggression: 46, diversification: 84, patience: 70, activity: 62 } },
  { archetype: 'THE WHALE', centroid: { risk: 58, timing: 76, aggression: 42, diversification: 30, patience: 84, activity: 40 } },
  { archetype: 'THE EXPLORER', centroid: { risk: 62, timing: 76, aggression: 58, diversification: 78, patience: 52, activity: 80 } },
  { archetype: 'THE DEGEN', centroid: { risk: 92, timing: 70, aggression: 88, diversification: 44, patience: 30, activity: 90 } },
  { archetype: 'THE GUARDIAN', centroid: { risk: 32, timing: 62, aggression: 26, diversification: 52, patience: 88, activity: 44 } },
  { archetype: 'THE NOMAD', centroid: { risk: 56, timing: 56, aggression: 48, diversification: 40, patience: 46, activity: 34 } },
];

/** Patience and activity separate the models most sharply; risk anchors them. */
const SHADOW_WEIGHTS: Centroid = {
  risk: 1,
  timing: 0.7,
  aggression: 1,
  diversification: 0.85,
  patience: 1.35,
  activity: 1.35,
};

/** Resolve the human wallet's archetype from its observed behaviour scores. */
export function resolveArchetype(scores: {
  riskScore: number;
  activityScore: number;
  diversityScore: number;
  holdingScore: number;
}): Archetype {
  return nearestArchetype(scores, HUMAN_CENTROIDS);
}

/** Resolve a Shadow's archetype from its decision model. */
export function resolveShadowArchetype(attributes: ShadowAttributes): Archetype {
  return nearestArchetype(attributes, SHADOW_CENTROIDS, SHADOW_WEIGHTS);
}

export const ARCHETYPE_ORDER: Archetype[] = [
  'THE HUNTER',
  'THE BUILDER',
  'THE WHALE',
  'THE EXPLORER',
  'THE DEGEN',
  'THE GUARDIAN',
  'THE NOMAD',
];
