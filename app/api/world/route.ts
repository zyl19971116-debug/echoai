import { LEADERBOARD, WORLD_AI_EDGE, WORLD_SERIES, WORLD_STATS } from '@/data/demo';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/world
 *
 * Global aggregates plus the shadow leaderboard.
 * Future source: an aggregated index of every wallet the platform has
 * processed — the shape is already the one the world page consumes.
 */
export async function GET() {
  return ok({
    stats: WORLD_STATS,
    aiEdge: WORLD_AI_EDGE,
    series: WORLD_SERIES,
    leaderboard: LEADERBOARD,
    totals: {
      shadows: LEADERBOARD.length,
      averageDifference:
        Math.round(
          (LEADERBOARD.reduce((sum, row) => sum + row.difference, 0) / Math.max(LEADERBOARD.length, 1)) * 10,
        ) / 10,
    },
  });
}
