import { createHash } from 'node:crypto';
import type { TransactionChain, WalletTransaction, WalletTransactionPage } from '@/types';
import { hasAlchemyConfig, getTransferPage, getAlchemyApiKey, getTokenMetadata, type TokenMetadata } from './alchemy';
import { TRANSACTION_CHAINS, validateChainAddress } from '@/lib/chains';
import { enrichTransactionsWithUsd } from './prices';

const TOKEN_NAMES: Record<string, string> = {
  ETH: 'Ethereum', WETH: 'Wrapped Ether', USDC: 'USD Coin', USDT: 'Tether USD', BNB: 'BNB', CAKE: 'PancakeSwap',
  AERO: 'Aerodrome Finance', ARB: 'Arbitrum', RWA: 'Tokenized Real-World Asset', POL: 'Polygon Ecosystem Token',
  OP: 'Optimism', SOL: 'Solana', JUP: 'Jupiter', NFT: 'Non-fungible token',
};

function tokenName(symbol: string): string {
  return TOKEN_NAMES[symbol.toUpperCase()] ?? symbol;
}

function pnlSummary(transactions: WalletTransaction[]) {
  const values = transactions.map((tx) => tx.pnlUsd).filter((value): value is number => value !== null);
  const profitUsd = values.filter((value) => value > 0).reduce((sum, value) => sum + value, 0);
  const lossUsd = Math.abs(values.filter((value) => value < 0).reduce((sum, value) => sum + value, 0));
  return { profitUsd, lossUsd, netUsd: profitUsd - lossUsd, pricedTransactions: values.length };
}

function directionFor(address: string, from: string, to: string | null): WalletTransaction['direction'] {
  const target = address.toLowerCase();
  if (from.toLowerCase() === target && to?.toLowerCase() === target) return 'self';
  return from.toLowerCase() === target ? 'out' : 'in';
}

function encodeCursor(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeCursor<T>(value?: string | null): T | undefined {
  if (!value) return undefined;
  try { return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T; } catch { return undefined; }
}

async function evmPage(address: string, chain: TransactionChain, cursor: string | null, limit: number): Promise<WalletTransactionPage> {
  const chainId = TRANSACTION_CHAINS[chain].chainId!;
  const state = decodeCursor<{ out?: string; in?: string; outDone?: boolean; inDone?: boolean }>(cursor) ?? {};
  const half = Math.max(1, Math.ceil(limit / 2));
  const [outgoing, incoming] = await Promise.all([
    state.outDone ? Promise.resolve({ transfers: [], pageKey: undefined }) : getTransferPage(address, 'fromAddress', chainId, state.out, half),
    state.inDone ? Promise.resolve({ transfers: [], pageKey: undefined }) : getTransferPage(address, 'toAddress', chainId, state.in, half),
  ]);
  const transferItems = [...outgoing.transfers, ...incoming.transfers];
  const contracts = [...new Set(transferItems.flatMap((item) => {
    const contract = item.category === 'erc20' ? item.rawContract?.address?.toLowerCase() : null;
    return contract ? [contract] : [];
  }))];
  const metadataByContract = new Map<string, TokenMetadata>();
  for (let index = 0; index < contracts.length; index += 4) {
    await Promise.all(contracts.slice(index, index + 4).map(async (contract) => {
      try {
        metadataByContract.set(contract, await getTokenMetadata(contract, chainId));
      } catch {
        // Some spam or malformed contracts do not implement standard metadata.
      }
    }));
  }

  const unique = new Map<string, WalletTransaction>();
  for (const item of transferItems) {
    const id = item.uniqueId ?? `${item.hash}:${item.category}:${item.from}:${item.to ?? ''}`;
    const contract = item.rawContract?.address?.toLowerCase();
    const metadata = contract ? metadataByContract.get(contract) : undefined;
    const asset = metadata?.symbol ?? item.asset ?? item.category.toUpperCase();
    unique.set(id, {
      id, chain, hash: item.hash, from: item.from, to: item.to, asset, tokenName: metadata?.name ?? tokenName(asset),
      value: item.value, usdValue: null, pnlUsd: null, pnlPercent: null, category: item.category, timestamp: item.metadata?.blockTimestamp ?? null,
      direction: directionFor(address, item.from, item.to),
    });
  }
  const transactions = [...unique.values()]
    .sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''))
    .slice(0, limit);
  await enrichTransactionsWithUsd(transactions);
  const outDone = !outgoing.pageKey;
  const inDone = !incoming.pageKey;
  return {
    chain, address, transactions,
    nextCursor: outDone && inDone ? null : encodeCursor({ out: outgoing.pageKey, in: incoming.pageKey, outDone, inDone }),
    source: 'indexer',
    pnlSummary: pnlSummary(transactions),
  };
}

interface SolanaRpcTransaction {
  signature?: string;
  blockTime?: number;
  slot?: number;
  err?: unknown;
}

async function solanaPage(address: string, cursor: string | null, limit: number): Promise<WalletTransactionPage> {
  const state = decodeCursor<{ token?: string }>(cursor);
  const response = await fetch(`https://solana-mainnet.g.alchemy.com/v2/${getAlchemyApiKey()}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, cache: 'no-store',
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTransactionsForAddress', params: [address, {
      transactionDetails: 'signatures', sortOrder: 'desc', limit: Math.min(limit, 100), ...(state?.token ? { paginationToken: state.token } : {}),
    }] }),
  });
  if (!response.ok) throw new Error(`Solana RPC returned ${response.status}`);
  const body = await response.json() as { result?: { data?: SolanaRpcTransaction[]; transactions?: SolanaRpcTransaction[]; paginationToken?: string }; error?: { message?: string } };
  if (body.error || !body.result) throw new Error(body.error?.message ?? 'Solana RPC failed');
  const rows = body.result.data ?? body.result.transactions ?? [];
  const transactions: WalletTransaction[] = rows.map((row, index) => ({
      id: row.signature ?? `${row.slot ?? 0}:${index}`, chain: 'sol', hash: row.signature ?? '', from: address, to: null,
      asset: 'SOL', tokenName: 'Solana', value: null, usdValue: null, pnlUsd: null, pnlPercent: null,
      category: row.err ? 'failed' : 'transaction',
      timestamp: row.blockTime ? new Date(row.blockTime * 1000).toISOString() : null, direction: 'self',
    }));
  return {
    chain: 'sol', address, source: 'indexer',
    transactions,
    nextCursor: body.result.paginationToken ? encodeCursor({ token: body.result.paginationToken }) : null,
    pnlSummary: pnlSummary(transactions),
  };
}

function demoPage(address: string, chain: TransactionChain, cursor: string | null, limit: number): WalletTransactionPage {
  const page = decodeCursor<{ page: number }>(cursor)?.page ?? 0;
  const total = 47;
  const start = page * limit;
  const count = Math.max(0, Math.min(limit, total - start));
  const assets: Record<TransactionChain, string[]> = {
    eth: ['ETH', 'USDC', 'WETH'], bsc: ['BNB', 'USDT', 'CAKE'], base: ['ETH', 'USDC', 'AERO'],
    arb: ['ETH', 'ARB', 'USDC'], rb: ['ETH', 'USDC', 'RWA'], polygon: ['POL', 'USDC', 'WETH'], optimism: ['ETH', 'OP', 'USDC'], sol: ['SOL', 'USDC', 'JUP'],
  };
  const transactions: WalletTransaction[] = Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const digest = createHash('sha256').update(`${address}:${chain}:${index}`).digest('hex');
    const incoming = Number.parseInt(digest.slice(0, 2), 16) % 2 === 0;
    const peer = chain === 'sol' ? digest.slice(0, 44) : `0x${digest.slice(0, 40)}`;
    const hash = chain === 'sol' ? `${digest}${digest.slice(0, 24)}` : `0x${digest}${digest}`;
    const asset = assets[chain][index % assets[chain].length];
    const value = Number(((Number.parseInt(digest.slice(2, 8), 16) % 250000) / 1000).toFixed(3));
    const usdRates: Record<string, number> = { ETH: 2650, WETH: 2650, USDC: 1, USDT: 1, BNB: 610, CAKE: 2.7, AERO: 0.82, ARB: 0.75, RWA: 1.25, POL: 0.42, OP: 1.65, SOL: 155, JUP: 0.88 };
    const usdValue = value * (usdRates[asset] ?? 1);
    const pnlPercent = Number((((Number.parseInt(digest.slice(8, 12), 16) % 7001) - 3000) / 100).toFixed(2));
    const pnlUsd = Number((usdValue * pnlPercent / 100).toFixed(2));
    return {
      id: `${chain}-${index}`, chain, hash, from: incoming ? peer : address, to: incoming ? address : peer,
      asset, tokenName: tokenName(asset), value, usdValue: Number(usdValue.toFixed(2)), pnlUsd, pnlPercent,
      category: index % 5 === 0 ? 'erc721' : 'transfer', timestamp: new Date(Date.UTC(2026, 8, 30 - index, 12, 0)).toISOString(),
      direction: incoming ? 'in' as const : 'out' as const,
    };
  });
  return { chain, address, transactions, nextCursor: start + count < total ? encodeCursor({ page: page + 1 }) : null, source: 'mock', pnlSummary: pnlSummary(transactions) };
}

export async function getWalletTransactionPage(address: string, chain: TransactionChain, cursor: string | null, limit: number) {
  if (!validateChainAddress(address, chain)) throw new Error(`Invalid ${TRANSACTION_CHAINS[chain].label} address`);
  if (!hasAlchemyConfig()) return demoPage(address, chain, cursor, limit);
  return chain === 'sol' ? solanaPage(address, cursor, limit) : evmPage(address, chain, cursor, limit);
}
