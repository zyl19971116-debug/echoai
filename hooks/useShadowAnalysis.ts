'use client';

import { useEffect, useState } from 'react';
import type { AIShadowProfile, ApiEnvelope, PortfolioPoint, TimelineEvent, WalletProfile } from '@/types';

export interface ShadowAnalysisPayload {
  shadow: AIShadowProfile;
  profile: WalletProfile;
  window: number;
  series: PortfolioPoint[];
  events: TimelineEvent[];
  endValues: { human: number; ai: number };
  notice?: string;
  dataSource: 'mock' | 'indexer';
}

export function useShadowAnalysis(address: string, days: number, chainId?: number, enabled = true) {
  const [data, setData] = useState<ShadowAnalysisPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !address) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const chainQuery = chainId ? `&chainId=${chainId}` : '';
    fetch(`/api/shadow/${address}?days=${days}${chainQuery}`, { signal: controller.signal })
      .then(async (response) => (await response.json()) as ApiEnvelope<ShadowAnalysisPayload>)
      .then((body) => {
        if (!body.ok || !body.data) throw new Error(body.error?.message ?? 'Shadow analysis failed.');
        setData(body.data);
      })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Shadow analysis failed.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [address, days, chainId, enabled]);

  return { data, loading, error };
}
