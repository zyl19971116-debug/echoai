'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ApiEnvelope, TransactionChain, WalletTransactionPage } from '@/types';

export function useWalletTransactions(address: string, chain: TransactionChain, enabled: boolean) {
  const [data, setData] = useState<WalletTransactionPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<string | null>>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setCursor(null);
    setHistory([]);
    setData(null);
    setError(null);
  }, [address, chain]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const query = new URLSearchParams({ chain, limit: '20' });
    if (cursor) query.set('cursor', cursor);
    fetch(`/api/transactions/${encodeURIComponent(address)}?${query}`, { signal: controller.signal })
      .then(async (response) => (await response.json()) as ApiEnvelope<WalletTransactionPage>)
      .then((body) => {
        if (!body.ok || !body.data) throw new Error(body.error?.message ?? 'Transaction lookup failed.');
        setData(body.data);
      })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Transaction lookup failed.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [address, chain, cursor, enabled, reloadKey]);

  const next = useCallback(() => {
    if (!data?.nextCursor) return;
    setHistory((current) => [...current, cursor]);
    setCursor(data.nextCursor);
  }, [cursor, data?.nextCursor]);

  const previous = useCallback(() => {
    setHistory((current) => {
      if (!current.length) return current;
      setCursor(current[current.length - 1]);
      return current.slice(0, -1);
    });
  }, []);

  return { data, loading, error, next, previous, canPrevious: history.length > 0, refresh: () => setReloadKey((key) => key + 1) };
}
