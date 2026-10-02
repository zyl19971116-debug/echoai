import type { NextRequest } from 'next/server';
import { WalletError } from '@/lib/walletAnalysis';
import { buildPortfolioSeries, generateShadow, generateTimelineEvents } from '@/lib/shadowEngine';
import { fail, ok, parseDays } from '@/lib/api';
import { getWalletProfile } from '@/lib/onchain/walletService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/shadow/[address]?days=30
 *
 * Returns the AI Shadow, its decision model, the parallel portfolio series and
 * the decision log for the requested window.
 *
 * Future source: the same payload produced by an LLM behaviour model instead
 * of the deterministic engine — the contract stays identical.
 */
export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  void request;
  void params;
  return fail('wallet_unavailable', 'Generated timelines and portfolio projections have been removed. Use the live transaction endpoint.');
  /* Legacy generated analysis intentionally disabled.
  try {
    const requestedChain = Number(request.nextUrl.searchParams.get('chainId') ?? 1);
    const chainId = [1, 10, 56, 137, 8453, 42161, 4663].includes(requestedChain) ? requestedChain : 1;
    const result = await getWalletProfile(params.address, chainId);
    const { profile } = result;
    const days = parseDays(request.nextUrl.searchParams.get('days'));
    if (profile.isEmpty) return fail('empty_wallet', 'This wallet has no public history to build a Shadow from.');
    const shadow = generateShadow(profile);
    const series = buildPortfolioSeries(profile, shadow, days);
    const events = generateTimelineEvents(profile, shadow, days);
    const last = series[series.length - 1];
    return ok({ shadow, profile, window: days, series, events, endValues: { human: last.human, ai: last.ai }, notice: result.notice, dataSource: result.source }, undefined, result.source);
  } catch (error) {
    if (error instanceof WalletError) return fail(error.code, error.message);
    return fail('analysis_failed', 'Shadow analysis failed. Please try again.');
  }
  */
}
