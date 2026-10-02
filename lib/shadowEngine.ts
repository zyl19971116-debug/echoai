import type {
  AIShadowProfile,
  Archetype,
  BattleMetricCompare,
  BattleResult,
  BattleSeriesPoint,
  PortfolioPoint,
  ShadowAttributes,
  TimelineEvent,
  WalletProfile,
} from '@/types';
import { resolveShadowArchetype } from './archetypes';
import { REFERENCE_MS, clamp, createRng, daysAgoIso, hashString, randomInt, roundTo } from './seed';
import { formatDateShort } from './format';

/** Every simulated portfolio starts from the same notional balance. */
export const SIMULATION_START_VALUE = 1000;
const DAY_MS = 86_400_000;

/* ------------------------------------------------------------------ */
/* Attribute model                                                     */
/* ------------------------------------------------------------------ */

export const ATTRIBUTE_ORDER: { key: keyof ShadowAttributes; label: string; blurb: string }[] = [
  { key: 'risk', label: 'RISK', blurb: 'Tolerance for unproven exposure' },
  { key: 'patience', label: 'PATIENCE', blurb: 'Willingness to hold through drawdown' },
  { key: 'aggression', label: 'AGGRESSION', blurb: 'Position sizing under conviction' },
  { key: 'diversification', label: 'DIVERSIFICATION', blurb: 'Spread across protocols and assets' },
  { key: 'timing', label: 'TIMING', blurb: 'Entry quality relative to market moves' },
  { key: 'activity', label: 'ACTIVITY', blurb: 'On-chain interaction frequency' },
  { key: 'confidence', label: 'CONFIDENCE', blurb: 'Model certainty for this Shadow' },
];

function buildShadowAttributes(profile: WalletProfile, rng: () => number): ShadowAttributes {
  const risk = clamp(Math.round(profile.riskScore + randomInt(rng, -6, 16)));
  const activity = clamp(Math.round(profile.activityScore + randomInt(rng, -4, 13)));
  const aggression = clamp(
    Math.round(profile.riskScore * 0.42 + profile.activityScore * 0.36 + randomInt(rng, 6, 20)),
  );
  const patience = clamp(
    Math.round(100 - aggression * 0.7 - profile.tradingFrequency * 1.7 + randomInt(rng, -8, 12)),
  );
  const diversification = clamp(Math.round(profile.diversityScore + randomInt(rng, -8, 18)));
  const timing = clamp(
    Math.round(48 + (profile.walletAge / 1640) * 22 + randomInt(rng, 10, 28)),
  );
  const confidence = clamp(randomInt(rng, 74, 97));

  return { risk, patience, aggression, diversification, timing, activity, confidence };
}

/* ------------------------------------------------------------------ */
/* Shadow generation                                                   */
/* ------------------------------------------------------------------ */

export function generateShadow(profile: WalletProfile): AIShadowProfile {
  const seed = hashString(`${profile.address.toLowerCase()}:shadow:v1`);
  const rng = createRng(seed);
  const attributes = buildShadowAttributes(profile, rng);
  const archetype: Archetype = resolveShadowArchetype(attributes);

  const tag = profile.address.slice(-4).toUpperCase();
  const createdAt = daysAgoIso(randomInt(rng, 0, 42));

  return {
    id: `#E-${profile.address.slice(2, 6).toUpperCase()}-${profile.address.slice(-2).toUpperCase()}`,
    name: `ECHO·${tag}`,
    archetype,
    address: profile.address,
    createdAt,
    attributes,
    summary: buildSummary(profile, archetype),
    personality: generatePersonality(profile, attributes),
  };
}

function buildSummary(profile: WalletProfile, archetype: Archetype): string {
  if (profile.isEmpty) {
    return 'This wallet has no public history yet — the Shadow has nothing to diverge from.';
  }
  const freq =
    profile.tradingFrequency >= 6
      ? 'high-frequency rotation'
      : profile.tradingFrequency >= 2.4
        ? 'measured rotation'
        : 'low-frequency conviction';
  return `Forked from ${profile.activeDays} active days and ${profile.transactions.toLocaleString(
    'en-US',
  )} transactions, then replayed with a ${archetype.toLowerCase().replace('the ', '')} decision model and ${freq}.`;
}

/**
 * The "ON-CHAIN PERSONALITY" paragraph. Every sentence is selected by the
 * actual profile values, so the copy can never contradict the numbers above it.
 */
export function generatePersonality(profile: WalletProfile, a: ShadowAttributes): string {
  if (profile.isEmpty) {
    return 'No public on-chain history was found for this address. ECHO AI needs at least a handful of transactions before it can build a behaviour model that means anything.';
  }

  const sentences: string[] = [];

  /* --- risk appetite --- */
  if (a.risk >= 72 && profile.tradingFrequency >= 3.5) {
    sentences.push(
      'You move quickly into emerging assets, rotate positions frequently, and interact with new protocols earlier than most wallets.',
    );
  } else if (a.risk >= 72) {
    sentences.push(
      'You take outsized positions when conviction is high and treat variance as the cost of finding new markets first.',
    );
  } else if (a.risk <= 38) {
    sentences.push(
      'You avoid unproven contracts, prefer positions that can be explained in a single sentence, and let time do the compounding.',
    );
  } else {
    sentences.push(
      'You size new exposure deliberately, balancing a speculative sleeve against the rest of the book.',
    );
  }

  /* --- breadth --- */
  if (profile.diversityScore >= 72) {
    sentences.push(
      `Across ${profile.protocols} protocols your footprint is unusually wide — breadth itself is part of the strategy, not a side effect.`,
    );
  } else if (profile.diversityScore <= 45) {
    sentences.push(
      `With activity concentrated across ${profile.protocols} protocols, you go deep instead of wide and rarely chase a narrative you did not already hold.`,
    );
  } else {
    sentences.push(
      `Your ${profile.protocols}-protocol footprint is balanced: selective about new venues, but not allergic to them.`,
    );
  }

  /* --- holding behaviour --- */
  if (profile.holdingScore >= 68) {
    sentences.push(
      `Holding behaviour dominates — positions sit for long stretches and the ${profile.activeDays} active days read as patient accumulation.`,
    );
  } else if (profile.holdingScore <= 42) {
    sentences.push(
      `Holding windows are short. A ${roundTo(profile.tradingFrequency, 2)} tx/active-day rate marks you as an operator, not a collector.`,
    );
  } else {
    sentences.push(
      `You hold through the first leg of a move and exit into strength — turnover sits at ${roundTo(
        profile.tradingFrequency,
        2,
      )} transactions per active day.`,
    );
  }

  /* --- shadow divergence --- */
  const timingGap = a.timing - a.risk;
  sentences.push(
    timingGap >= 8
      ? 'The Shadow leans on timing rather than conviction: same entry universe, later exits, fewer round trips.'
      : 'The Shadow keeps your silhouette but trades a tighter risk budget, trimming the tail outcomes on both sides.',
  );

  return sentences.join(' ');
}

/* ------------------------------------------------------------------ */
/* Portfolio simulation                                                */
/* ------------------------------------------------------------------ */

interface CurveOptions {
  salt: string;
  days: number;
  /** total multiple applied over the full window (1.4 = +40%) */
  target: number;
  /** daily volatility */
  volatility: number;
  start?: number;
}

/**
 * Deterministic geometric random walk that always terminates near `target`.
 * Volatility is scaled by horizon length so long windows stay readable.
 */
function buildCurve({ salt, days, target, volatility, start = SIMULATION_START_VALUE }: CurveOptions): number[] {
  const rng = createRng(hashString(salt));
  const horizon = Math.max(1, days);
  const drift = Math.log(Math.max(1.02, target)) / horizon;
  const vol = volatility / Math.sqrt(horizon / 30);

  const values: number[] = [start];
  let value = start;

  for (let i = 1; i <= horizon; i += 1) {
    const shock = (rng() * 2 - 1) * vol;
    // mild mean-reversion keeps the curve from drifting into nonsense territory
    const reversion = (drift * i - Math.log(value / start)) * 0.06;
    value *= Math.exp(drift + shock + reversion);
    values.push(Math.max(start * 0.35, value));
  }

  return values.map((v) => roundTo(v, 2));
}

/** Human vs Shadow curve for one wallet, indexed from the fixed reference date. */
export function buildPortfolioSeries(
  profile: WalletProfile,
  shadow: AIShadowProfile,
  days = 365,
): PortfolioPoint[] {
  const humanTarget = 1.16 + (profile.holdingScore / 100) * 0.44 + (profile.activityScore / 100) * 0.34;
  const humanVol = 0.006 + (profile.riskScore / 100) * 0.011;

  const a = shadow.attributes;
  const aiEdge = 0.5 + (a.timing / 100) * 0.86 + (a.diversification / 100) * 0.42;
  const aiVol = 0.007 + (a.aggression / 100) * 0.013;

  const base = profile.address.toLowerCase();
  const human = buildCurve({ salt: `${base}:curve:${days}:human`, days, target: humanTarget, volatility: humanVol });
  const ai = buildCurve({ salt: `${base}:curve:${days}:shadow`, days, target: humanTarget + aiEdge, volatility: aiVol });

  return human.map((humanValue, i) => ({
    day: i,
    date: new Date(REFERENCE_MS - (days - i) * DAY_MS).toISOString(),
    human: humanValue,
    ai: ai[i],
  }));
}

/** Slice the tail of a series for the 7D / 30D / 90D / 1Y / ALL filters. */
export function sliceSeries(series: PortfolioPoint[], range: string): PortfolioPoint[] {
  const map: Record<string, number> = { '7D': 7, '30D': 30, '90D': 90, '1Y': 365 };
  const size = map[range];
  if (!size || size >= series.length) return series;
  return series.slice(series.length - size);
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

const ASSET_POOL = ['ETH', 'SOL', 'ARB', 'OP', 'LINK', 'MATIC', 'AAVE', 'LDO', 'PEPE', 'WIF'];
const PROTOCOL_POOL = [
  'a new LRT vault',
  'an unverified lending market',
  'a fresh perp DEX',
  'a restaking module',
  'a points program',
  'a bridge contract',
];

export function generateTimelineEvents(
  profile: WalletProfile,
  shadow: AIShadowProfile,
  days = 30,
): TimelineEvent[] {
  const rng = createRng(hashString(`${profile.address.toLowerCase()}:timeline:${days}`));
  const anchorDays = [1, 4, 9, 14, 21, 27].filter((d) => d <= days);
  const aggressive = shadow.attributes.aggression >= 68;
  const patient = shadow.attributes.patience >= 58;

  return anchorDays.map((day, index) => {
    const asset = ASSET_POOL[(index * 3 + randomInt(rng, 0, ASSET_POOL.length - 1)) % ASSET_POOL.length];
    const protocol = PROTOCOL_POOL[randomInt(rng, 0, PROTOCOL_POOL.length - 1)];

    const templates: { humanAction: string; aiAction: string; verdict: TimelineEvent['verdict'] }[] = [
      {
        humanAction: 'Held ETH. No changes to the core position.',
        aiAction: aggressive
          ? 'Reduced ETH exposure by 40% and rotated into stables.'
          : 'Held ETH but hedged 15% of the position.',
        verdict: aggressive ? 'AI' : 'EVEN',
      },
      {
        humanAction: `Bought ${asset} after a 3-day run.`,
        aiAction: patient ? `Skipped ${asset} — entry quality scored below threshold.` : `Scaled into ${asset} earlier, at a better average.`,
        verdict: patient ? 'AI' : 'EVEN',
      },
      {
        humanAction: `Deposited into ${protocol}.`,
        aiAction: `Waited for the audit window, then entered at half size.`,
        verdict: 'AI',
      },
      {
        humanAction: `Sold part of the ${asset} position into strength.`,
        aiAction: `Held the full position — momentum model still positive.`,
        verdict: 'EVEN',
      },
      {
        humanAction: 'Rebalanced manually across two ecosystems.',
        aiAction: 'Rebalanced automatically within a fixed risk budget.',
        verdict: index % 2 === 0 ? 'AI' : 'HUMAN',
      },
      {
        humanAction: 'Took profit on the swing position.',
        aiAction: 'Rolled the position into the higher-conviction leg.',
        verdict: 'AI',
      },
    ];

    const t = templates[index % templates.length];
    return { day, ...t };
  });
}

export function buildTimelineEvents(
  profile: WalletProfile,
  shadow: AIShadowProfile,
  days: number,
): TimelineEvent[] {
  return generateTimelineEvents(profile, shadow, days);
}

/* ------------------------------------------------------------------ */
/* Battle                                                              */
/* ------------------------------------------------------------------ */

export function simulateBattle(
  leftProfile: WalletProfile,
  rightProfile: WalletProfile,
  days = 30,
): BattleResult {
  const leftShadow = generateShadow(leftProfile);
  const rightShadow = generateShadow(rightProfile);

  const leftCurve = buildCurve({
    salt: `${leftProfile.address.toLowerCase()}:battle:${days}`,
    days,
    target: 1.2 + (leftShadow.attributes.timing / 100) * 0.9 + (leftShadow.attributes.diversification / 100) * 0.5,
    volatility: 0.01 + (leftShadow.attributes.aggression / 100) * 0.02,
  });
  const rightCurve = buildCurve({
    salt: `${rightProfile.address.toLowerCase()}:battle:${days}`,
    days,
    target: 1.2 + (rightShadow.attributes.timing / 100) * 0.9 + (rightShadow.attributes.diversification / 100) * 0.5,
    volatility: 0.01 + (rightShadow.attributes.aggression / 100) * 0.02,
  });

  const series: BattleSeriesPoint[] = leftCurve.map((left, i) => ({
    day: i,
    date: new Date(REFERENCE_MS - (days - i) * DAY_MS).toISOString(),
    left,
    right: rightCurve[i],
  }));

  const leftGrowth = roundTo((leftCurve[leftCurve.length - 1] / SIMULATION_START_VALUE - 1) * 100, 1);
  const rightGrowth = roundTo((rightCurve[rightCurve.length - 1] / SIMULATION_START_VALUE - 1) * 100, 1);

  const metrics: BattleMetricCompare[] = ATTRIBUTE_ORDER.filter((m) => m.key !== 'confidence').map((m) => ({
    key: m.key,
    label: m.label,
    left: leftShadow.attributes[m.key],
    right: rightShadow.attributes[m.key],
  }));

  const advantage = roundTo(Math.abs(leftGrowth - rightGrowth), 1);

  return {
    days,
    left: {
      address: leftProfile.address,
      profile: leftProfile,
      shadow: leftShadow,
      growth: leftGrowth,
      endValue: leftCurve[leftCurve.length - 1],
    },
    right: {
      address: rightProfile.address,
      profile: rightProfile,
      shadow: rightShadow,
      growth: rightGrowth,
      endValue: rightCurve[rightCurve.length - 1],
    },
    metrics,
    series,
    winner: leftGrowth === rightGrowth ? 'draw' : leftGrowth > rightGrowth ? 'left' : 'right',
    advantage,
    createdAt: new Date(REFERENCE_MS).toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

export function attributeList(attributes: ShadowAttributes): { key: keyof ShadowAttributes; label: string; blurb: string; value: number }[] {
  return ATTRIBUTE_ORDER.map((entry) => ({ ...entry, value: attributes[entry.key] }));
}

/** Radar-ready array (recharts expects `{ axis, value }`). */
export function radarData(attributes: ShadowAttributes, compareTo?: ShadowAttributes) {
  return ATTRIBUTE_ORDER.filter((a) => a.key !== 'confidence').map((entry) => ({
    axis: entry.label.slice(0, 4),
    full: entry.label,
    value: attributes[entry.key],
    compare: compareTo ? compareTo[entry.key] : undefined,
  }));
}

export function seriesEndValue(series: PortfolioPoint[]): { human: number; ai: number } {
  const last = series[series.length - 1];
  return last ? { human: last.human, ai: last.ai } : { human: 0, ai: 0 };
}

export function growthFromSeries(series: PortfolioPoint[]): { human: number; ai: number } {
  const { human, ai } = seriesEndValue(series);
  return {
    human: roundTo((human / SIMULATION_START_VALUE - 1) * 100, 1),
    ai: roundTo((ai / SIMULATION_START_VALUE - 1) * 100, 1),
  };
}

export function labelForDay(dayIndex: number, total: number): string {
  const iso = new Date(REFERENCE_MS - (total - dayIndex) * DAY_MS).toISOString();
  return formatDateShort(iso);
}
