import type { TransactionChain } from '@/types';

export const TRANSACTION_CHAINS: Record<TransactionChain, { label: string; chainId?: number; address: 'evm' | 'sol' }> = {
  eth: { label: 'Ethereum', chainId: 1, address: 'evm' },
  bsc: { label: 'BNB Chain', chainId: 56, address: 'evm' },
  base: { label: 'Base', chainId: 8453, address: 'evm' },
  arb: { label: 'Arbitrum', chainId: 42161, address: 'evm' },
  rb: { label: 'Robinhood', chainId: 4663, address: 'evm' },
  polygon: { label: 'Polygon', chainId: 137, address: 'evm' },
  optimism: { label: 'Optimism', chainId: 10, address: 'evm' },
  sol: { label: 'Solana', address: 'sol' },
};

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const SOL_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isTransactionChain(value: string): value is TransactionChain {
  return value in TRANSACTION_CHAINS;
}

export function validateChainAddress(address: string, chain: TransactionChain): boolean {
  return TRANSACTION_CHAINS[chain].address === 'evm' ? EVM_ADDRESS.test(address) : SOL_ADDRESS.test(address);
}
