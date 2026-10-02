import type { WalletProfile } from '@/types';
import { WalletError } from '@/lib/walletAnalysis';
import { buildIndexedWalletProfile } from './profileBuilder';
import { hasAlchemyConfig } from './alchemy';

export interface WalletProfileResult {
  profile: WalletProfile;
  source: 'mock' | 'indexer';
  notice?: string;
}

export async function getWalletProfile(address: string, chainId = 1): Promise<WalletProfileResult> {
  if (!hasAlchemyConfig()) {
    throw new WalletError('wallet_unavailable', 'Live indexing is unavailable. No demo wallet data will be generated.');
  }

  try {
    const result = await buildIndexedWalletProfile(address, chainId);
    return { profile: result.profile, source: result.source };
  } catch (error) {
    if (error instanceof WalletError) throw error;
    throw new WalletError('analysis_failed', 'The chain indexer could not analyse this wallet. Try again shortly.');
  }
}
