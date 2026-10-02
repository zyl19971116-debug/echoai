/**
 * Minimal EIP-1193 provider typing.
 *
 * ECHO AI intentionally ships without a wallet SDK dependency: the adapter
 * layer below only needs `request`, so there is nothing to configure and the
 * build cannot break when a library changes. Swapping in wagmi / RainbowKit
 * later means implementing this same interface.
 */
export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isOkxWallet?: boolean;
  isRainbow?: boolean;
  providers?: Eip1193Provider[];
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    coinbaseWalletExtension?: Eip1193Provider;
    okxwallet?: Eip1193Provider;
    rainbow?: { ethereum?: Eip1193Provider };
    phantom?: { solana?: SolanaProvider };
    solana?: SolanaProvider;
  }
}

export interface SolanaProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect?(): Promise<void>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  off?(event: string, listener: (...args: unknown[]) => void): void;
}

export {};
