import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Panel } from '@/components/ui/Panel';

export const metadata: Metadata = {
  title: 'The Echo World',
  description: 'Verified aggregate statistics from real connected wallets only.',
};

export default function WorldPage() {
  return (
    <PageShell>
      <div className="pb-12 pt-10">
        <p className="kicker">Verified wallet records</p>
        <h1 className="display mt-4 text-[2.6rem] uppercase text-white sm:text-[3.4rem]">The Echo World</h1>
      </div>
      <Panel frame className="mx-auto max-w-3xl p-9 text-center">
        <h2 className="display text-[1.5rem] uppercase text-white">No verified aggregate data yet</h2>
        <p className="mx-auto mt-4 max-w-xl text-[0.86rem] leading-relaxed text-echo-muted">
          Fixed demo totals and the fictional leaderboard have been removed. This page will only display wallets and
          statistics recorded from real wallet connections after a persistent data store is connected.
        </p>
        <Link href="/my-echo" className="mt-7 inline-flex rounded-sm border border-echo-blue/40 bg-echo-blue/[0.1] px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white hover:bg-echo-blue/[0.18]">
          Open my wallet
        </Link>
      </Panel>
    </PageShell>
  );
}
