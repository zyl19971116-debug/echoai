import { getAlchemyApiKey } from './alchemy';

interface PricePoint {
  value: number;
  timestamp: number;
}

const currentCache = new Map<string, { value: number; expiresAt: number }>();
const historicalCache = new Map<string, { points: PricePoint[]; expiresAt: number }>();
const FIVE_MINUTES = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function normalizedSymbols(symbols: string[]) {
  return [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
}

export async function getCurrentUsdPrices(symbols: string[]): Promise<Map<string, number>> {
  const now = Date.now();
  const result = new Map<string, number>();
  const missing: string[] = [];

  for (const symbol of normalizedSymbols(symbols)) {
    const cached = currentCache.get(symbol);
    if (cached && cached.expiresAt > now) result.set(symbol, cached.value);
    else missing.push(symbol);
  }

  if (missing.length) {
    try {
      const url = new URL(`https://api.g.alchemy.com/prices/v1/${getAlchemyApiKey()}/tokens/by-symbol`);
      for (const symbol of missing) url.searchParams.append('symbols', symbol);
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const body = await response.json() as { data?: Array<{ symbol?: string; prices?: Array<{ currency?: string; value?: string }> }> };
        for (const token of body.data ?? []) {
          const symbol = token.symbol?.toUpperCase();
          const raw = token.prices?.find((price) => price.currency?.toLowerCase() === 'usd')?.value;
          const value = raw ? Number(raw) : Number.NaN;
          if (symbol && Number.isFinite(value)) {
            result.set(symbol, value);
            currentCache.set(symbol, { value, expiresAt: now + FIVE_MINUTES });
          }
        }
      }
    } catch {
      // Valuation is optional; never hide the underlying on-chain transfer.
    }
  }

  return result;
}

async function getHistoricalSeries(symbol: string, timestamps: number[]): Promise<PricePoint[]> {
  const first = Math.min(...timestamps);
  const last = Math.max(...timestamps);
  const start = new Date(first);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(last);
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() + 1);
  const cacheKey = `${symbol}:${start.toISOString()}:${end.toISOString()}`;
  const cached = historicalCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.points;

  // Avoid requesting multi-year daily series for a single transaction page.
  if (end.getTime() - start.getTime() > 370 * 24 * ONE_HOUR) return [];

  try {
    const response = await fetch(`https://api.g.alchemy.com/prices/v1/${getAlchemyApiKey()}/tokens/historical`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ symbol, startTime: start.toISOString(), endTime: end.toISOString(), interval: '1d' }),
    });
    if (!response.ok) return [];
    const body = await response.json() as { data?: Array<{ value?: string; timestamp?: string }> };
    const points = (body.data ?? []).flatMap((point) => {
      const value = Number(point.value);
      const timestamp = point.timestamp ? Date.parse(point.timestamp) : Number.NaN;
      return Number.isFinite(value) && Number.isFinite(timestamp) ? [{ value, timestamp }] : [];
    });
    historicalCache.set(cacheKey, { points, expiresAt: Date.now() + ONE_HOUR });
    return points;
  } catch {
    return [];
  }
}

export async function enrichTransactionsWithUsd<T extends { asset: string; value: number | null; timestamp: string | null; category: string; direction: string; usdValue: number | null; pnlUsd: number | null; pnlPercent: number | null }>(transactions: T[]): Promise<T[]> {
  const fungible = transactions.filter((tx) => tx.value !== null && tx.value > 0 && !['erc721', 'erc1155', 'specialnft'].includes(tx.category));
  const prices = await getCurrentUsdPrices(fungible.map((tx) => tx.asset));

  await Promise.all(normalizedSymbols(fungible.map((tx) => tx.asset)).map(async (symbol) => {
    const matching = fungible.filter((tx) => tx.asset.toUpperCase() === symbol && tx.timestamp);
    const current = prices.get(symbol);
    if (current === undefined) return;
    const timestamps = matching.map((tx) => Date.parse(tx.timestamp!)).filter(Number.isFinite);
    const series = timestamps.length ? await getHistoricalSeries(symbol, timestamps) : [];

    for (const tx of matching) {
      if (tx.value === null) continue;
      tx.usdValue = Number((tx.value * current).toFixed(2));
      if (!series.length) continue;
      const at = Date.parse(tx.timestamp!);
      const historical = series.reduce((best, point) => Math.abs(point.timestamp - at) < Math.abs(best.timestamp - at) ? point : best);
      if (historical.value <= 0) continue;
      const change = (current - historical.value) / historical.value;
      // This is market-price movement since the transfer, not tax/accounting cost basis.
      tx.pnlUsd = Number((tx.value * (current - historical.value)).toFixed(2));
      tx.pnlPercent = Number((change * 100).toFixed(2));
    }
  }));

  for (const tx of fungible) {
    if (tx.value === null || tx.usdValue !== null) continue;
    const current = prices.get(tx.asset.toUpperCase());
    if (current !== undefined) tx.usdValue = Number((tx.value * current).toFixed(2));
  }
  return transactions;
}
