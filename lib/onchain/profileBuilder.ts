import type { WalletProfile } from '@/types';
import { resolveArchetype } from '@/lib/archetypes';
import { clamp, roundTo } from '@/lib/seed';
import { isValidAddress, WalletError } from '@/lib/walletAnalysis';
import { getCurrentNftCount, getNativeTransactionCount, getWalletTransfers, hasAlchemyConfig } from './alchemy';
import { enrichTransactionsWithUsd } from './prices';

export interface ProfileResult {
  profile: WalletProfile;
  source: 'indexer';
  dataQuality: {
    transfersLoaded: number;
    capped: boolean;
    chainId: number;
  };
}

const DAY_MS = 86_400_000;

async function estimatePerformance(address: string, transfers: Awaited<ReturnType<typeof getWalletTransfers>>) {
  const lower = address.toLowerCase();
  const cutoff = Date.now() - 365 * DAY_MS;
  const candidates = transfers
    .filter((item) => {
      const at = item.metadata?.blockTimestamp ? Date.parse(item.metadata.blockTimestamp) : Number.NaN;
      return item.asset && item.value !== null && item.value > 0 && Number.isFinite(at) && at >= cutoff
        && !['erc721', 'erc1155', 'specialnft'].includes(item.category);
    })
    .sort((a, b) => (b.metadata?.blockTimestamp ?? '').localeCompare(a.metadata?.blockTimestamp ?? ''))
    .slice(0, 120)
    .map((item) => ({
      asset: item.asset!, value: item.value, timestamp: item.metadata?.blockTimestamp ?? null,
      category: item.category, direction: item.from.toLowerCase() === lower ? 'out' : 'in',
      usdValue: null as number | null, pnlUsd: null as number | null, pnlPercent: null as number | null,
    }));

  await enrichTransactionsWithUsd(candidates);
  const priced = candidates.filter((item) => item.pnlPercent !== null && item.usdValue !== null);
  if (!priced.length) return { score: 0, confidence: 0, sampleSize: 0 };

  let weighted = 0;
  let weightTotal = 0;
  for (const item of priced) {
    // Receiving before appreciation and sending before depreciation are rewarded.
    const direction = item.direction === 'out' ? -1 : 1;
    const signal = Math.max(-100, Math.min(200, item.pnlPercent!)) * direction;
    // Square-root weighting prevents one whale-sized transfer from deciding the battle.
    const weight = Math.max(1, Math.sqrt(Math.min(item.usdValue!, 1_000_000)));
    weighted += signal * weight;
    weightTotal += weight;
  }
  const confidence = clamp(Math.round((1 - Math.exp(-priced.length / 18)) * 100));
  const raw = weightTotal ? weighted / weightTotal : 0;
  // Shrink sparse samples toward zero and cap extreme token moves.
  const score = roundTo(Math.max(-80, Math.min(120, raw)) * (0.35 + confidence / 154), 2);
  return { score, confidence, sampleSize: priced.length };
}

export async function buildIndexedWalletProfile(address: string, chainId = 1): Promise<ProfileResult> {
  const normalized = address.trim();
  if (!isValidAddress(normalized)) throw new WalletError('invalid_address', 'Expected a 42-character EVM address.');
  if (!hasAlchemyConfig()) throw new WalletError('wallet_unavailable', 'Live indexing is not configured.');

  const [transfers, nftCount, outgoingNonce] = await Promise.all([
    getWalletTransfers(normalized, chainId),
    getCurrentNftCount(normalized, chainId),
    getNativeTransactionCount(normalized, chainId),
  ]);

  const timestamps = transfers
    .map((item) => item.metadata?.blockTimestamp)
    .filter((value): value is string => Boolean(value))
    .sort();
  const activeDates = new Set(timestamps.map((value) => value.slice(0, 10)));
  const firstSeen = timestamps[0] ?? new Date().toISOString();
  const lastActive = timestamps[timestamps.length - 1] ?? firstSeen;
  const walletAge = timestamps.length
    ? Math.max(1, Math.ceil((Date.now() - new Date(firstSeen).getTime()) / DAY_MS))
    : 0;

  const contracts = new Set<string>();
  const assets = new Set<string>();
  let tokenTransfers = 0;
  let nftTransfers = 0;
  let outgoing = 0;
  const lower = normalized.toLowerCase();

  for (const transfer of transfers) {
    const contract = transfer.rawContract?.address?.toLowerCase();
    if (contract) contracts.add(contract);
    if (transfer.asset) assets.add(transfer.asset.toUpperCase());
    if (transfer.category === 'erc20') tokenTransfers += 1;
    if (['erc721', 'erc1155', 'specialnft'].includes(transfer.category)) nftTransfers += 1;
    if (transfer.from?.toLowerCase() === lower) outgoing += 1;
  }

  const sampledTransactions = new Set(transfers.map((item) => item.hash)).size;
  const transactions = Math.max(outgoingNonce, sampledTransactions);
  const activeDays = activeDates.size;
  // Active days come from the capped transfer sample, so frequency must use that same sample.
  const tradingFrequency = activeDays ? roundTo(sampledTransactions / activeDays, 2) : 0;
  const transferTotal = Math.max(1, transfers.length);
  const tokenShare = tokenTransfers / transferTotal;
  const nftShare = nftTransfers / transferTotal;
  const outgoingShare = outgoing / transferTotal;

  const activityScore = clamp(Math.round(Math.log10(transactions + 1) * 22 + Math.min(activeDays / 365, 1) * 34));
  const diversityScore = clamp(Math.round(Math.min(contracts.size / 45, 1) * 72 + Math.min(assets.size / 20, 1) * 28));
  const riskScore = clamp(Math.round(tokenShare * 48 + nftShare * 22 + Math.min(tradingFrequency / 8, 1) * 30));
  const holdingScore = clamp(Math.round(100 - outgoingShare * 52 - Math.min(tradingFrequency / 10, 1) * 38));
  const archetype = resolveArchetype({ riskScore, activityScore, diversityScore, holdingScore });
  const performance = await estimatePerformance(normalized, transfers);

  return {
    source: 'indexer',
    dataQuality: { transfersLoaded: transfers.length, capped: transfers.length >= 1_400, chainId },
    profile: {
      address: normalized,
      walletAge,
      transactions,
      activeDays,
      protocols: contracts.size,
      nftCount,
      riskScore,
      activityScore,
      diversityScore,
      holdingScore,
      tradingFrequency,
      performanceScore: performance.score,
      performanceConfidence: performance.confidence,
      performanceSampleSize: performance.sampleSize,
      archetype,
      firstSeen,
      lastActive,
      isEmpty: transfers.length === 0 && transactions === 0,
    },
  };
}
