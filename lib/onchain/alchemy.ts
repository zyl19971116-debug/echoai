export const ALCHEMY_NETWORKS = {
  1: 'eth-mainnet',
  56: 'bnb-mainnet',
  137: 'polygon-mainnet',
  8453: 'base-mainnet',
  42161: 'arb-mainnet',
  4663: 'robinhood-mainnet',
  10: 'opt-mainnet',
} as const;

export type SupportedChainId = keyof typeof ALCHEMY_NETWORKS;

interface RpcEnvelope<T> {
  result?: T;
  error?: { message?: string };
}

export interface AssetTransfer {
  uniqueId?: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  rawContract?: { address?: string | null };
  metadata?: { blockTimestamp?: string };
}

interface TransferPage {
  transfers: AssetTransfer[];
  pageKey?: string;
}

export interface TransferQueryPage extends TransferPage {}

export interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

const tokenMetadataCache = new Map<string, TokenMetadata>();

function apiKey(): string {
  const value = process.env.ALCHEMY_API_KEY?.trim();
  if (!value) throw new Error('ALCHEMY_API_KEY is not configured');
  return value;
}

function network(chainId: number): string {
  const value = ALCHEMY_NETWORKS[chainId as SupportedChainId];
  if (!value) throw new Error(`Unsupported chain ${chainId}`);
  return value;
}

export function alchemyNetwork(chainId: number): string {
  return network(chainId);
}

export function getAlchemyApiKey(): string {
  return apiKey();
}

function transferCategories(chainId: number): string[] {
  const categories = ['external', 'erc20', 'erc721', 'erc1155'];
  if ([1, 137, 8453].includes(chainId)) categories.push('internal');
  if (chainId === 1) categories.push('specialnft');
  return categories;
}

export async function getTransferPage(
  address: string,
  direction: 'fromAddress' | 'toAddress',
  chainId: number,
  pageKey?: string,
  maxCount = 25,
): Promise<TransferQueryPage> {
  const options: Record<string, unknown> = {
    fromBlock: '0x0',
    toBlock: 'latest',
    order: 'desc',
    withMetadata: true,
    excludeZeroValue: false,
    maxCount: `0x${Math.min(100, Math.max(1, maxCount)).toString(16)}`,
    category: transferCategories(chainId),
    [direction]: address,
  };
  if (pageKey) options.pageKey = pageKey;
  return alchemyRpc<TransferPage>('alchemy_getAssetTransfers', [options], chainId);
}

export function hasAlchemyConfig(): boolean {
  if (process.env.DATA_MODE?.trim().toLowerCase() === 'demo') return false;
  return Boolean(process.env.ALCHEMY_API_KEY?.trim());
}

export async function alchemyRpc<T>(method: string, params: unknown[], chainId = 1): Promise<T> {
  const response = await fetch(`https://${network(chainId)}.g.alchemy.com/v2/${apiKey()}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Alchemy RPC returned ${response.status}`);
  const body = (await response.json()) as RpcEnvelope<T>;
  if (body.error || body.result === undefined) throw new Error(body.error?.message ?? 'Alchemy RPC failed');
  return body.result;
}

export async function getTokenMetadata(contractAddress: string, chainId = 1): Promise<TokenMetadata> {
  const cacheKey = `${chainId}:${contractAddress.toLowerCase()}`;
  const cached = tokenMetadataCache.get(cacheKey);
  if (cached) return cached;

  const raw = await alchemyRpc<{ name?: string | null; symbol?: string | null; decimals?: number | null; logo?: string | null }>(
    'alchemy_getTokenMetadata',
    [contractAddress],
    chainId,
  );
  const metadata: TokenMetadata = {
    name: raw.name?.trim() || null,
    symbol: raw.symbol?.trim() || null,
    decimals: typeof raw.decimals === 'number' ? raw.decimals : null,
    logo: raw.logo ?? null,
  };
  tokenMetadataCache.set(cacheKey, metadata);
  return metadata;
}

async function transferDirection(address: string, direction: 'fromAddress' | 'toAddress', chainId: number) {
  const output: AssetTransfer[] = [];
  let pageKey: string | undefined;

  for (let page = 0; page < 5; page += 1) {
    const options: Record<string, unknown> = {
      fromBlock: '0x0',
      toBlock: 'latest',
      withMetadata: true,
      excludeZeroValue: false,
      maxCount: '0x3e8',
      category: transferCategories(chainId),
      [direction]: address,
    };
    if (pageKey) options.pageKey = pageKey;

    const result = await alchemyRpc<TransferPage>('alchemy_getAssetTransfers', [options], chainId);
    output.push(...result.transfers);
    pageKey = result.pageKey;
    if (!pageKey) break;
  }
  return output;
}

export async function getWalletTransfers(address: string, chainId = 1): Promise<AssetTransfer[]> {
  const [outgoing, incoming] = await Promise.all([
    transferDirection(address, 'fromAddress', chainId),
    transferDirection(address, 'toAddress', chainId),
  ]);
  const unique = new Map<string, AssetTransfer>();
  for (const transfer of [...outgoing, ...incoming]) {
    unique.set(transfer.uniqueId ?? `${transfer.hash}:${transfer.category}:${transfer.from}:${transfer.to}`, transfer);
  }
  return [...unique.values()].sort((a, b) =>
    (a.metadata?.blockTimestamp ?? '').localeCompare(b.metadata?.blockTimestamp ?? ''),
  );
}

export async function getCurrentNftCount(address: string, chainId = 1): Promise<number> {
  const url = new URL(`https://${network(chainId)}.g.alchemy.com/nft/v3/${apiKey()}/getNFTsForOwner`);
  url.searchParams.set('owner', address);
  url.searchParams.set('withMetadata', 'false');
  url.searchParams.set('pageSize', '1');
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return 0;
  const body = (await response.json()) as { totalCount?: number };
  return body.totalCount ?? 0;
}

export async function getNativeTransactionCount(address: string, chainId = 1): Promise<number> {
  const result = await alchemyRpc<string>('eth_getTransactionCount', [address, 'latest'], chainId);
  return Number.parseInt(result, 16) || 0;
}
