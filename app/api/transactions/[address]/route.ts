import type { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api';
import { getWalletTransactionPage } from '@/lib/onchain/transactions';
import { isTransactionChain } from '@/lib/chains';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  const chain = request.nextUrl.searchParams.get('chain') ?? 'eth';
  const cursor = request.nextUrl.searchParams.get('cursor');
  const limit = Math.min(50, Math.max(5, Number(request.nextUrl.searchParams.get('limit') ?? 20) || 20));
  if (!isTransactionChain(chain)) return fail('unsupported_network', 'This blockchain is not supported.');
  try {
    const page = await getWalletTransactionPage(params.address, chain, cursor, limit);
    return ok(page, undefined, page.source);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Transaction lookup failed.';
    console.error('Transaction lookup failed', { chain, address: params.address, message });
    if (message.startsWith('Invalid')) return fail('invalid_address', message);
    return fail('analysis_failed', 'Could not load this transaction page. Please try again.');
  }
}
