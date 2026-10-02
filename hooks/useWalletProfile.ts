'use client';

import { useEffect, useState } from 'react';
import type { AIShadowProfile, ApiEnvelope, WalletProfile } from '@/types';

interface WalletProfilePayload {
  profile: WalletProfile;
  shadowPreview: AIShadowProfile;
  summary: { footprint: string; isEmpty: boolean; notice?: string };
  dataSource: 'mock' | 'indexer';
}

export function useWalletProfile(address: string, enabled = true, chainId?: number) {
  const [data, setData] = useState<WalletProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const query = chainId ? `?chainId=${chainId}` : '';
    fetch(`/api/wallet/${address}${query}`, { signal: controller.signal })
      .then(async (response) => (await response.json()) as ApiEnvelope<WalletProfilePayload>)
      .then((body) => {
        if (!body.ok || !body.data) throw new Error(body.error?.message ?? 'Wallet analysis failed.');
        setData(body.data);
      })
      .catch((reason: unknown) => {
        if ((reason as { name?: string })?.name !== 'AbortError') setError(reason instanceof Error ? reason.message : 'Wallet analysis failed.');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [address, enabled, chainId]);

  return { data, loading, error };
}
