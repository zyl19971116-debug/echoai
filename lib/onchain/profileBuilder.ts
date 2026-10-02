import type { WalletProfile } from '@/types';
import { resolveArchetype } from '@/lib/archetypes';
import { clamp, roundTo } from '@/lib/seed';
import { isValidAddress, WalletError } from '@/lib/walletAnalysis';
import { getCurrentNftCount, getNativeTransactionCount, getWalletTransfers, hasAlchemyConfig } from './alchemy';

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

  const transactions = Math.max(outgoingNonce, new Set(transfers.map((item) => item.hash)).size);
  const activeDays = activeDates.size;
  const tradingFrequency = activeDays ? roundTo(transactions / activeDays, 2) : 0;
  const transferTotal = Math.max(1, transfers.length);
  const tokenShare = tokenTransfers / transferTotal;
  const nftShare = nftTransfers / transferTotal;
  const outgoingShare = outgoing / transferTotal;

  const activityScore = clamp(Math.round(Math.log10(transactions + 1) * 22 + Math.min(activeDays / 365, 1) * 34));
  const diversityScore = clamp(Math.round(Math.min(contracts.size / 45, 1) * 72 + Math.min(assets.size / 20, 1) * 28));
  const riskScore = clamp(Math.round(tokenShare * 48 + nftShare * 22 + Math.min(tradingFrequency / 8, 1) * 30));
  const holdingScore = clamp(Math.round(100 - outgoingShare * 52 - Math.min(tradingFrequency / 10, 1) * 38));
  const archetype = resolveArchetype({ riskScore, activityScore, diversityScore, holdingScore });

  return {
    source: 'indexer',
    dataQuality: { transfersLoaded: transfers.length, capped: transfers.length >= 10_000, chainId },
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
      archetype,
      firstSeen,
      lastActive,
      isEmpty: transfers.length === 0 && transactions === 0,
    },
  };
}
