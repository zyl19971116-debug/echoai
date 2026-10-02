'use client';

import { useEffect, useState } from 'react';
import { SHADOW_REGISTRY_EVENT, countShadowWallets } from '@/lib/shadowRegistry';

/**
 * Number of wallets that actually connected and created a Shadow on this
 * device. Reads only after mount, so server and client render the same
 * initial value (0) and hydration stays clean.
 */
export function useShadowCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(countShadowWallets());

    update();
    window.addEventListener(SHADOW_REGISTRY_EVENT, update);
    // React to changes made in other tabs.
    window.addEventListener('storage', update);

    return () => {
      window.removeEventListener(SHADOW_REGISTRY_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return count;
}
