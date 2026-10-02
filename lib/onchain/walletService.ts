import type { WalletProfile } from '@/types';
import { DEMO_WALLET } from '@/data/demo';
import { analyzeWallet, WalletError } from '@/lib/walletAnalysis';
import { buildIndexedWalletProfile } from './profileBuilder';
import { hasAlchemyConfig } from './alchemy';

export interface WalletProfileResult {
  profile: WalletProfile;
  source: 'mock' | 'indexer';
  notice?: string;
}

export async function getWalletProfile(address: string, chainId = 1): Promise<WalletProfileResult> {
  const isDemo = address.toLowerCase() === DEMO_WALLET.toLowerCase();
  // The showcase address is intentionally synthetic. It must never be sent to
  // a live indexer: having an Alchemy key configured would otherwise turn the
  // demo profile into an empty real-chain profile.
  if (isDemo) {
    return {
      profile: analyzeWallet(address),
      source: 'mock',
      notice: 'Demo wallet uses deterministic data.',
    };
  }
  if (!hasAlchemyConfig()) {
    return {
      profile: analyzeWallet(address),
      source: 'mock',
      notice: 'Live indexing is disabled until ALCHEMY_API_KEY is configured.',
    };
  }

  try {
    const result = await buildIndexedWalletProfile(address, chainId);
    return { profile: result.profile, source: result.source };
  } catch (error) {
    if (error instanceof WalletError) throw error;
    throw new WalletError('analysis_failed', 'The chain indexer could not analyse this wallet. Try again shortly.');
  }
}
