'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { Badge } from '@/components/ui/Badge';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { TRANSACTION_CHAINS, validateChainAddress } from '@/lib/chains';
import { shortAddress } from '@/lib/walletAnalysis';
import type { TransactionChain } from '@/types';

const CHAINS = Object.entries(TRANSACTION_CHAINS) as Array<[TransactionChain, (typeof TRANSACTION_CHAINS)[TransactionChain]]>;
const EXPLORERS: Partial<Record<TransactionChain, string>> = {
  eth: 'https://etherscan.io/tx/', bsc: 'https://bscscan.com/tx/', base: 'https://basescan.org/tx/',
  arb: 'https://arbiscan.io/tx/', rb: 'https://robinhoodchain.blockscout.com/tx/', polygon: 'https://polygonscan.com/tx/',
  optimism: 'https://optimistic.etherscan.io/tx/', sol: 'https://solscan.io/tx/',
};

export function TransactionExplorer({ connectedAddress, initialChain = 'eth' }: { connectedAddress: string; initialChain?: TransactionChain }) {
  const [chain, setChain] = useState<TransactionChain>(initialChain);
  const [draft, setDraft] = useState(connectedAddress);
  const [queryAddress, setQueryAddress] = useState(connectedAddress);
  const valid = useMemo(() => validateChainAddress(queryAddress, chain), [queryAddress, chain]);
  const { data, loading, error, next, previous, canPrevious, refresh } = useWalletTransactions(queryAddress, chain, valid);

  useEffect(() => {
    if (TRANSACTION_CHAINS[chain].address === 'evm') {
      setDraft(connectedAddress);
      setQueryAddress(connectedAddress);
    } else {
      const solAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(connectedAddress) ? connectedAddress : '';
      setDraft(solAddress);
      setQueryAddress(solAddress);
    }
  }, [chain, connectedAddress]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setQueryAddress(draft.trim());
  };

  return (
    <section className="pb-14">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="kicker">Multi-chain activity</p>
          <h2 className="display mt-2 text-[1.55rem] uppercase text-white">Wallet transaction explorer</h2>
          <p className="mt-2 max-w-2xl text-[0.76rem] leading-relaxed text-echo-faint">
            Public, read-only history. Results are requested one page at a time; switching chains resets pagination.
          </p>
        </div>
        <Badge tone="cyan">Live indexer</Badge>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex gap-2 overflow-x-auto border-b border-white/[0.07] p-3">
          {CHAINS.map(([id, item]) => (
            <button key={id} type="button" onClick={() => setChain(id)}
              className={`shrink-0 rounded-sm border px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition ${chain === id ? 'border-echo-blue/50 bg-echo-blue/[0.1] text-white' : 'border-white/[0.07] text-echo-faint hover:text-white'}`}>
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Wallet address</span>
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-echo-faint" />
            <input value={draft} onChange={(event) => setDraft(event.target.value)}
              placeholder={chain === 'sol' ? 'Paste a Solana address' : 'Connected EVM wallet address'}
              className="mono h-11 w-full rounded-sm border border-white/10 bg-black/20 pl-9 pr-3 text-[0.72rem] text-white outline-none transition focus:border-echo-blue/50" />
          </label>
          <button type="submit" className="h-11 rounded-sm border border-echo-blue/40 bg-echo-blue/[0.1] px-5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white hover:bg-echo-blue/[0.18]">Query chain</button>
          <button type="button" onClick={refresh} disabled={!valid || loading} aria-label="Refresh transactions" className="flex h-11 w-11 items-center justify-center rounded-sm border border-white/10 text-echo-muted hover:text-white disabled:opacity-40">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>

        {valid && data && !error && (
          <div className="grid gap-px border-b border-white/[0.07] bg-white/[0.06] sm:grid-cols-3">
            <div className="bg-[#090E1A] px-5 py-4">
              <p className="text-[0.56rem] uppercase tracking-[0.16em] text-echo-faint">Estimated market gain</p>
              <p className="mono mt-2 text-[1rem] font-semibold text-echo-cyan">+${data.pnlSummary.profitUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#090E1A] px-5 py-4">
              <p className="text-[0.56rem] uppercase tracking-[0.16em] text-echo-faint">Estimated market loss</p>
              <p className="mono mt-2 text-[1rem] font-semibold text-[#FF8E83]">-${data.pnlSummary.lossUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-[#090E1A] px-5 py-4">
              <p className="text-[0.56rem] uppercase tracking-[0.16em] text-echo-faint">Net market change · this page</p>
              <p className={`mono mt-2 text-[1rem] font-semibold ${data.pnlSummary.netUsd >= 0 ? 'text-echo-cyan' : 'text-[#FF8E83]'}`}>
                {data.pnlSummary.netUsd >= 0 ? '+' : '-'}${Math.abs(data.pnlSummary.netUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
              {data.pnlSummary.pricedTransactions === 0 && <p className="mt-1 text-[0.55rem] text-echo-faint">No comparable historical price</p>}
            </div>
          </div>
        )}

        {!valid && (
          <div className="p-8 text-center text-[0.76rem] text-echo-faint">
            {chain === 'sol' ? 'Paste a valid Solana address to query this chain.' : 'The connected wallet does not contain a valid EVM address.'}
          </div>
        )}
        {valid && loading && !data && <div className="flex items-center justify-center gap-2 p-10 text-[0.72rem] uppercase tracking-[0.15em] text-echo-faint"><Loader2 className="h-4 w-4 animate-spin" />Loading this page</div>}
        {valid && error && <div className="p-8 text-center text-[0.76rem] text-[#FFB49A]">{error}</div>}
        {valid && data && !error && (
          <>
            <div className="divide-y divide-white/[0.055]">
              {data.transactions.length === 0 && <div className="p-10 text-center text-[0.76rem] text-echo-faint">No transactions found on this page.</div>}
              {data.transactions.map((tx) => {
                const incoming = tx.direction === 'in';
                return (
                  <div key={tx.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[32px_1fr_auto] sm:items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${incoming ? 'border-echo-cyan/25 bg-echo-cyan/[0.07] text-echo-cyan' : 'border-echo-violet/25 bg-echo-violet/[0.07] text-[#C7AEFF]'}`}>
                      {incoming ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[0.76rem] font-semibold text-white">{incoming ? 'Received' : tx.direction === 'out' ? 'Sent' : 'Transaction'} {tx.tokenName}</span>
                        <span className="mono text-[0.6rem] text-echo-muted">{tx.asset}</span>
                        <span className="rounded-sm bg-white/[0.04] px-1.5 py-0.5 text-[0.52rem] uppercase text-echo-faint">{tx.category}</span>
                      </div>
                      <p className="mono mt-1 truncate text-[0.62rem] text-echo-faint">{shortAddress(tx.from, 5, 5)} → {tx.to ? shortAddress(tx.to, 5, 5) : 'contract'}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end sm:text-right">
                      <div>
                        <p className="mono text-[0.76rem] text-white">{tx.value === null ? '—' : tx.value.toLocaleString(undefined, { maximumFractionDigits: 5 })} {tx.asset}</p>
                        {tx.usdValue !== null && <p className="mono mt-1 text-[0.6rem] text-echo-faint">≈ ${tx.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>}
                        {tx.pnlUsd !== null && tx.pnlPercent !== null ? (
                          <p className={`mono mt-1 text-[0.62rem] font-semibold ${tx.pnlUsd >= 0 ? 'text-echo-cyan' : 'text-[#FF8E83]'}`}>
                            {tx.pnlUsd >= 0 ? 'Market gain +' : 'Market loss -'}${Math.abs(tx.pnlUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} ({tx.pnlPercent >= 0 ? '+' : ''}{tx.pnlPercent.toFixed(2)}%)
                          </p>
                        ) : <p className="mt-1 text-[0.55rem] text-echo-faint">P&amp;L unavailable</p>}
                        <p className="mt-1 text-[0.58rem] text-echo-faint">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Timestamp unavailable'}</p>
                      </div>
                      {tx.hash && EXPLORERS[chain] && <a href={`${EXPLORERS[chain]}${tx.hash}`} target="_blank" rel="noreferrer" aria-label="Open transaction in explorer" className="text-echo-faint hover:text-white"><ExternalLink className="h-3.5 w-3.5" /></a>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-3">
              <p className="text-[0.6rem] uppercase tracking-[0.13em] text-echo-faint">20 per page · {shortAddress(queryAddress, 5, 5)}</p>
              <div className="flex gap-2">
                <button type="button" onClick={previous} disabled={!canPrevious || loading} className="flex h-9 items-center gap-1 rounded-sm border border-white/10 px-3 text-[0.6rem] uppercase text-echo-muted disabled:opacity-30"><ChevronLeft className="h-3 w-3" />Previous</button>
                <button type="button" onClick={next} disabled={!data.nextCursor || loading} className="flex h-9 items-center gap-1 rounded-sm border border-white/10 px-3 text-[0.6rem] uppercase text-echo-muted disabled:opacity-30">Next<ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
            <p className="border-t border-white/[0.05] px-4 py-3 text-[0.58rem] leading-relaxed text-echo-faint">
              Live USD values use current Alchemy market prices. Market gain/loss compares the current price with the transfer-date price; it is an estimate, not realized profit or tax cost basis.
            </p>
          </>
        )}
      </Panel>
    </section>
  );
}
