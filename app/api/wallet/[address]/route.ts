import type { NextRequest } from 'next/server';
import { describeFootprint, WalletError } from '@/lib/walletAnalysis';
import { fail, ok } from '@/lib/api';
import { getWalletProfile } from '@/lib/onchain/walletService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/wallet/[address]
 *
 * Current source: deterministic mock analyser.
 * Future source:  RPC provider + blockchain indexer.
 *
 * Swapping the body for a real integration does not change the response
 * shape, so no UI code has to move.
 */
export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const requestedChain = Number(request.nextUrl.searchParams.get('chainId') ?? 1);
    const chainId = [1, 10, 56, 137, 8453, 42161, 4663].includes(requestedChain) ? requestedChain : 1;
    const result = await getWalletProfile(params.address, chainId);
    return ok({
      profile: result.profile,
      shadowPreview: null,
      summary: {
        footprint: describeFootprint(result.profile),
        isEmpty: Boolean(result.profile.isEmpty),
        notice: result.notice,
      },
      dataSource: result.source,
    }, undefined, result.source);
  } catch (error) {
    if (error instanceof WalletError) return fail(error.code, error.message);
    return fail('analysis_failed', 'Wallet analysis failed. Please try again.');
  }
}
