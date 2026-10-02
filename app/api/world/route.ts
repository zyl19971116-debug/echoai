import { fail } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/world
 *
 * Global aggregates plus the shadow leaderboard.
 * Future source: an aggregated index of every wallet the platform has
 * processed — the shape is already the one the world page consumes.
 */
export async function GET() {
  return fail('wallet_unavailable', 'Verified aggregate wallet storage is not configured. Demo totals are disabled.');
}
