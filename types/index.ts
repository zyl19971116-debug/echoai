/**
 * ECHO AI — shared domain types.
 *
 * The frontend only ever talks to these shapes, which means the demo data
 * layer, the API routes and any future indexer / AI backend can be swapped
 * without touching UI code.
 */

/* ------------------------------------------------------------------ */
/* Archetypes                                                          */
/* ------------------------------------------------------------------ */

export const ARCHETYPES = [
  'THE HUNTER',
  'THE BUILDER',
  'THE WHALE',
  'THE EXPLORER',
  'THE DEGEN',
  'THE GUARDIAN',
  'THE NOMAD',
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export type Accent = 'blue' | 'violet' | 'cyan';

export interface ArchetypeMeta {
  id: Archetype;
  tagline: string;
  description: string;
  accent: Accent;
}

/* ------------------------------------------------------------------ */
/* Wallet                                                              */
/* ------------------------------------------------------------------ */

export interface WalletProfile {
  address: string;
  /** days since the wallet's first observed transaction */
  walletAge: number;
  transactions: number;
  activeDays: number;
  protocols: number;
  nftCount: number;
  /** 0-100 scales */
  riskScore: number;
  activityScore: number;
  diversityScore: number;
  holdingScore: number;
  /** transactions per active day */
  tradingFrequency: number;
  /** Price-movement signal inferred from priced public transfers; not accounting P&L. */
  performanceScore?: number;
  /** 0-100 confidence based on the amount of priceable history. */
  performanceConfidence?: number;
  performanceSampleSize?: number;
  archetype: Archetype;
  /** ISO date of first observed activity */
  firstSeen: string;
  /** ISO date of last observed activity */
  lastActive: string;
  /** true when the source wallet has no usable public history */
  isEmpty?: boolean;
}

export type TransactionChain = 'eth' | 'bsc' | 'base' | 'arb' | 'rb' | 'polygon' | 'optimism' | 'sol';

export interface WalletTransaction {
  id: string;
  chain: TransactionChain;
  hash: string;
  from: string;
  to: string | null;
  asset: string;
  tokenName: string;
  value: number | null;
  usdValue: number | null;
  /** Estimated profit/loss for this position or disposal; null when cost basis is unavailable. */
  pnlUsd: number | null;
  pnlPercent: number | null;
  category: string;
  timestamp: string | null;
  direction: 'in' | 'out' | 'self';
}

export interface WalletTransactionPage {
  chain: TransactionChain;
  address: string;
  transactions: WalletTransaction[];
  nextCursor: string | null;
  source: 'indexer';
  pnlSummary: {
    profitUsd: number;
    lossUsd: number;
    netUsd: number;
    pricedTransactions: number;
  };
}

/* ------------------------------------------------------------------ */
/* AI Shadow                                                           */
/* ------------------------------------------------------------------ */

export interface ShadowAttributes {
  risk: number;
  patience: number;
  aggression: number;
  diversification: number;
  timing: number;
  activity: number;
  confidence: number;
}

export interface AIShadowProfile {
  id: string;
  name: string;
  archetype: Archetype;
  address: string;
  createdAt: string;
  attributes: ShadowAttributes;
  summary: string;
  /** generated "on-chain personality" paragraph */
  personality: string;
}

/* ------------------------------------------------------------------ */
/* Portfolio / timeline                                                */
/* ------------------------------------------------------------------ */

export interface PortfolioPoint {
  /** day index inside the series */
  day: number;
  /** ISO date for the point */
  date: string;
  human: number;
  ai: number;
}

export interface TimelineEvent {
  day: number;
  humanAction: string;
  aiAction: string;
  /** which side the simulation currently rewards */
  verdict: 'HUMAN' | 'AI' | 'EVEN';
}

export type RangeKey = '7D' | '30D' | '90D' | '1Y' | 'ALL';

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

export interface WorldStats {
  humans: number;
  shadows: number;
  humanValue: number;
  aiValue: number;
  humanChange: number;
  aiChange: number;
}

export interface LeaderboardRow {
  rank: number;
  shadow: string;
  archetype: Archetype;
  human: number;
  ai: number;
  difference: number;
  days: number;
}

export interface WorldSeriesPoint {
  label: string;
  human: number;
  ai: number;
}

/* ------------------------------------------------------------------ */
/* Battle                                                              */
/* ------------------------------------------------------------------ */

export type BattleSide = 'left' | 'right' | 'draw';

export interface BattleMetricCompare {
  key: keyof ShadowAttributes;
  label: string;
  left: number;
  right: number;
}

export interface BattleSideResult {
  address: string;
  profile: WalletProfile;
  shadow: AIShadowProfile;
  growth: number;
  endValue: number;
}

export interface BattleSeriesPoint {
  day: number;
  date: string;
  left: number;
  right: number;
}

export interface BattleResult {
  days: number;
  left: BattleSideResult;
  right: BattleSideResult;
  metrics: BattleMetricCompare[];
  series: BattleSeriesPoint[];
  winner: BattleSide;
  /** percentage-point advantage of the winner */
  advantage: number;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* API envelope                                                        */
/* ------------------------------------------------------------------ */

export type ApiErrorCode =
  | 'invalid_address'
  | 'empty_wallet'
  | 'unsupported_network'
  | 'analysis_failed'
  | 'bad_request'
  | 'wallet_unavailable'
  | 'connection_rejected'
  | 'unknown';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    source: 'indexer';
    generatedAt: string;
  };
}

/* ------------------------------------------------------------------ */
/* Wallet connection                                                   */
/* ------------------------------------------------------------------ */

export type WalletKind = 'okx' | 'metamask' | 'phantom' | 'rainbow' | 'coinbase' | 'walletconnect';

export type WalletStatus = 'disconnected' | 'connecting' | 'analyzing' | 'connected' | 'error';

export interface WalletNetwork {
  chainId: number;
  name: string;
  /** retained for persisted network compatibility; all supported wallets are live */
  simulated: boolean;
}

export interface WalletState {
  address: string | null;
  kind: WalletKind | null;
  status: WalletStatus;
  network: WalletNetwork | null;
  error: ApiError | null;
}
