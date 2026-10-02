import { NextResponse } from 'next/server';
import type { ApiEnvelope, ApiErrorCode } from '@/types';
import { REFERENCE_DATE } from './seed';

/**
 * Every route returns the same envelope so the frontend can be written once
 * and later pointed at an RPC provider, an indexer or an AI backend without
 * changing a single component.
 *
 *   { ok: true,  data: T, meta: { source, generatedAt } }
 *   { ok: false, error: { code, message } }
 */

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  invalid_address: 400,
  empty_wallet: 422,
  unsupported_network: 409,
  analysis_failed: 500,
  bad_request: 400,
  wallet_unavailable: 503,
  connection_rejected: 401,
  unknown: 500,
};

export function ok<T>(data: T, init?: ResponseInit, source: 'indexer' = 'indexer') {
  const body: ApiEnvelope<T> = {
    ok: true,
    data,
    meta: { source, generatedAt: new Date().toISOString() },
  };
  return NextResponse.json(body, {
    status: 200,
    headers: {
      // The demo dataset is deterministic, but these endpoints are the seam
      // where live data will arrive later.
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
    ...init,
  });
}

export function fail(code: ApiErrorCode, message: string) {
  const body: ApiEnvelope<never> = { ok: false, error: { code, message } };
  return NextResponse.json(body, { status: STATUS_BY_CODE[code] ?? 500 });
}

/** Guard for query-string numbers (`?days=30`). */
export function parseDays(value: string | null, fallback = 30, allowed = [7, 30, 90, 365]): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return allowed.includes(parsed) ? parsed : fallback;
}
