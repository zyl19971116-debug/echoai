'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { Panel } from '@/components/ui/Panel';

/**
 * Route-level error boundary. Users never see a raw stack trace — they get a
 * plain-language explanation and a way out.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface the digest only — never the raw developer error.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[echo-ai] route error', error.digest ?? error.message);
    }
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5 pt-32 pb-20">
      <Panel frame className="w-full max-w-xl p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#FF9C7A]/30 bg-[#FF9C7A]/[0.08]">
          <AlertTriangle className="h-5 w-5 text-[#FFB49A]" />
        </span>
        <h1 className="display mt-6 text-[1.6rem] uppercase text-white">The live data request failed</h1>
        <p className="mx-auto mt-4 max-w-md text-[0.86rem] leading-relaxed text-echo-muted">
          Something failed while rendering this screen. No wallet data was affected — ECHO AI² never holds custody of
          anything.
        </p>
        {error.digest && <p className="mono mt-4 text-[0.66rem] text-echo-faint">Reference: {error.digest}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <GlowButton onClick={reset} icon={<RotateCcw className="h-3.5 w-3.5" />}>
            Try again
          </GlowButton>
          <GlowButton href="/" variant="ghost">
            Back to home
          </GlowButton>
        </div>
      </Panel>
    </main>
  );
}
