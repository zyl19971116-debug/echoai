'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Copy, Globe, LogOut, Sparkles, Wallet } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useConnectFlow } from '@/hooks/useConnectFlow';
import { useToast } from '@/components/ui/Toast';
import { GlowButton } from '@/components/ui/GlowButton';
import { WalletLogo } from './WalletLogo';
import { shortAddress } from '@/lib/walletAnalysis';
import { cn } from '@/lib/format';

interface WalletButtonProps {
  className?: string;
  size?: 'sm' | 'md';
}

/**
 * Header wallet control. Connection itself is handled by `ConnectFlowProvider`
 * so the hero, the feature cards and the battle page all share one journey.
 */
export function WalletButton({ className, size = 'md' }: WalletButtonProps) {
  const { address, status, network, kind, disconnect, copyAddress } = useWallet();
  const { open } = useConnectFlow();
  const { push } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const connected = status === 'connected' && Boolean(address);
  const walletLabels = { okx: 'OKX Wallet', metamask: 'MetaMask', phantom: 'Phantom', rainbow: 'Rainbow', coinbase: 'Coinbase Wallet', walletconnect: 'WalletConnect' } as const;
  const connectedKind = kind ?? 'okx';

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleCopy = async () => {
    const ok = await copyAddress();
    setCopied(ok);
    push({
      title: ok ? 'Address copied' : 'Copy failed',
      description: ok ? 'The public address is on your clipboard.' : 'Your browser blocked clipboard access.',
      variant: ok ? 'success' : 'error',
    });
    if (ok) setTimeout(() => setCopied(false), 1800);
  };

  const handleDisconnect = () => {
    disconnect();
    setMenuOpen(false);
    push({ title: 'Wallet disconnected', description: 'No wallet data is retained locally.' });
  };

  if (!connected || !address) {
    return (
      <GlowButton
        size={size === 'sm' ? 'sm' : 'md'}
        onClick={() => open()}
        icon={<Wallet className="h-3.5 w-3.5" />}
        className={className}
      >
        {status === 'connecting' ? 'Connecting' : 'Connect wallet'}
      </GlowButton>
    );
  }

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        className={cn(
          'flex items-center gap-2.5 rounded-sm border border-echo-violet/30 bg-echo-violet/[0.07] px-3.5 transition-all duration-300 ease-echo hover:border-echo-violet/55 hover:bg-echo-violet/[0.12]',
          size === 'sm' ? 'h-9' : 'h-10',
        )}
      >
        <WalletLogo kind={connectedKind} className="h-5 w-5" />
        <span className="mono text-[0.76rem] font-medium text-white">{shortAddress(address, 2, 4)}</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-echo-faint transition-transform duration-300', menuOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[272px] overflow-hidden rounded-sm shadow-glow-lg"
          >
            <div className="border-b border-white/[0.07] px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2.5">
                  <WalletLogo kind={connectedKind} className="h-7 w-7" />
                  <span>
                    <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white">
                      {walletLabels[connectedKind]}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-echo-cyan">
                      <span className="h-1.5 w-1.5 rounded-full bg-echo-cyan" /> Connected
                    </span>
                  </span>
                </span>
              </div>
              <p className="mono mt-2 break-all text-[0.7rem] leading-relaxed text-echo-muted">{address}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[0.66rem] text-echo-faint">
                <Globe className="h-3 w-3" />
                {network?.name ?? 'Ethereum Mainnet'}
              </p>
            </div>

            <div className="flex flex-col p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleCopy}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-[0.74rem] text-echo-muted transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-echo-cyan" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Address copied' : 'Copy address'}
              </button>

              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="flex items-center gap-2.5 text-[0.74rem] text-echo-muted">
                  <Globe className="h-3.5 w-3.5" />
                  Network
                </span>
                <span className="mono text-[0.66rem] uppercase text-white/75">
                  {`Chain ${network?.chainId ?? 1}`}
                </span>
              </div>

              <Link
                href="/my-echo"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[0.74rem] text-echo-muted transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                View my AI Shadow
              </Link>

              <div className="mx-2 my-1 border-t border-white/[0.07]" />

              <button
                type="button"
                role="menuitem"
                onClick={handleDisconnect}
                className="m-1 flex items-center justify-center gap-2.5 rounded-[8px] border border-[#FF7B66]/25 bg-[#FF684F]/[0.07] px-3 py-2.5 text-center text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#FFA88F] transition-colors hover:border-[#FF7B66]/45 hover:bg-[#FF684F]/[0.13] hover:text-[#FFD0C3]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Disconnect wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
