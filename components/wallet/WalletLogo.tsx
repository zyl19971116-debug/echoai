import { Wallet } from 'lucide-react';
import type { WalletKind } from '@/types';
import { cn } from '@/lib/format';

interface WalletLogoProps {
  kind: WalletKind;
  className?: string;
}

const OFFICIAL_LOGOS: Partial<Record<WalletKind, string>> = {
  okx: '/assets/wallets/okx.png',
  metamask: '/assets/wallets/metamask.svg',
  phantom: '/assets/wallets/phantom.svg',
  rainbow: '/assets/wallets/rainbow.png',
  coinbase: '/assets/wallets/coinbase.png',
  walletconnect: '/assets/wallets/walletconnect.png',
};

/** Official wallet artwork stored locally from each brand's own website. */
export function WalletLogo({ kind, className }: WalletLogoProps) {
  const src = OFFICIAL_LOGOS[kind];
  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={cn('h-8 w-8 rounded-[9px] object-contain', className)}
      />
    );
  }

  return (
    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-echo-blue to-echo-violet', className)}>
      <Wallet className="h-4 w-4 text-white" />
    </span>
  );
}
