import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { EchoLogo } from '@/components/ui/EchoLogo';
import { NAV_ITEMS } from '@/lib/navigation';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.07] bg-void-900/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-echo-blue/35 to-transparent"
      />
      <div className="shell grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <EchoLogo />
          <p className="mt-5 max-w-sm text-[0.82rem] leading-relaxed text-echo-muted">
            ECHO AI² is a public-data experiment: it reads a wallet&apos;s on-chain history and builds an AI counterpart
            that makes different decisions from the same starting point.
          </p>
          <p className="mt-5 flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-echo-faint">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-echo-cyan" />
            Public on-chain data only. We never ask for a seed phrase or private key, and connecting a wallet never
            implies custody.
          </p>
        </div>

        <div>
          <p className="kicker mb-5">Experimental surface</p>
          <ul className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[0.78rem] uppercase tracking-[0.16em] text-echo-faint transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="kicker mb-5">Notice</p>
          <p className="text-[0.76rem] leading-relaxed text-echo-faint">
            Wallet balances and activity are read from public chains. AI projections, portfolio curves and battle
            results remain <span className="text-[#C7AEFF]">simulations</span>. Nothing here executes trades,
            custodies assets, or constitutes financial advice. No project token exists.
          </p>
        </div>
      </div>

      <div className="border-t border-white/[0.06] py-5">
        <div className="shell flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="mono text-[0.66rem] uppercase tracking-[0.18em] text-echo-faint">
            ECHO AI² · v1.0 · AI Shadow Experiment
          </p>
          <p className="mono text-[0.66rem] uppercase tracking-[0.18em] text-echo-faint">
            Humans vs AI · simulated
          </p>
        </div>
      </div>
    </footer>
  );
}
