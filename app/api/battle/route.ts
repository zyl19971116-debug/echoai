import type { NextRequest } from 'next/server';
import { WalletError } from '@/lib/walletAnalysis';
import { simulateBattle } from '@/lib/shadowEngine';
import { fail, ok, parseDays } from '@/lib/api';
import { getWalletProfile } from '@/lib/onchain/walletService';

export const dynamic = 'force-dynamic';

interface BattlePayload {
  one?: string;
  two?: string;
  days?: number;
}

async function readPayload(request: NextRequest): Promise<BattlePayload> {
  if (request.method === 'POST') {
    try {
      return (await request.json()) as BattlePayload;
    } catch {
      return {};
    }
  }
  const params = request.nextUrl.searchParams;
  return {
    one: params.get('one') ?? undefined,
    two: params.get('two') ?? undefined,
    days: parseDays(params.get('days')),
  };
}

/**
 * /api/battle — POST { one, two, days } or GET ?one=&two=&days=
 *
 * Builds both Shadows and replays the same window for each.
 * Future source: identical contract, but the decision models would come from a
 * hosted AI service instead of the deterministic engine.
 */
async function handle(request: NextRequest) {
  const payload = await readPayload(request);

  if (!payload.one || !payload.two) {
    return fail('bad_request', 'Two wallet addresses are required to create a battle.');
  }

  if (payload.one.trim().toLowerCase() === payload.two.trim().toLowerCase()) {
    return fail('bad_request', 'A Shadow cannot battle itself — pick two different wallets.');
  }

  try {
    const [left, right] = await Promise.all([getWalletProfile(payload.one), getWalletProfile(payload.two)]);
    if (left.profile.isEmpty || right.profile.isEmpty) return fail('empty_wallet', 'Both wallets need public on-chain history before they can be simulated.');
    const days = parseDays(String(payload.days ?? 30) as string | null);
    const source = left.source === 'indexer' && right.source === 'indexer' ? 'indexer' : 'mock';
    return ok({ ...simulateBattle(left.profile, right.profile, days), dataSource: source }, undefined, source);
  } catch (error) {
    if (error instanceof WalletError) return fail(error.code, error.message);
    return fail('analysis_failed', 'Battle analysis failed. Please try again.');
  }
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
