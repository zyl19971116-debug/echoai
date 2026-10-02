'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ApiError, WalletKind, WalletNetwork, WalletState } from '@/types';
import { isValidAddress } from '@/lib/walletAnalysis';

const STORAGE_KEY = 'echo-ai:wallet:v1';

const SUPPORTED_CHAIN_ID = 1;

const DEFAULT_NETWORK: WalletNetwork = {
  chainId: SUPPORTED_CHAIN_ID,
  name: 'Ethereum Mainnet',
  simulated: false,
};

const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  10: 'OP Mainnet',
  56: 'BNB Chain',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum One',
  4663: 'Robinhood Chain',
};

export interface WalletAdapter {
  kind: WalletKind;
  label: string;
  description: string;
  /** true when the adapter can run without any browser extension */
  simulated: boolean;
}

export const WALLET_ADAPTERS: WalletAdapter[] = [
  { kind: 'okx', label: 'OKX Wallet', description: 'Multi-chain browser wallet', simulated: false },
  {
    kind: 'metamask',
    label: 'MetaMask',
    description: 'Browser extension · EIP-1193',
    simulated: false,
  },
  {
    kind: 'phantom',
    label: 'Phantom',
    description: 'Solana wallet · browser extension',
    simulated: false,
  },
  {
    kind: 'rainbow',
    label: 'Rainbow',
    description: 'Ethereum wallet · browser or mobile',
    simulated: false,
  },
  {
    kind: 'coinbase',
    label: 'Coinbase Wallet',
    description: 'Extension or mobile app',
    simulated: false,
  },
  {
    kind: 'walletconnect',
    label: 'WalletConnect',
    description: 'Any mobile wallet · QR pairing',
    simulated: false,
  },
];

interface WalletContextValue extends WalletState {
  connect: (kind: WalletKind) => Promise<boolean>;
  disconnect: () => void;
  copyAddress: () => Promise<boolean>;
  clearError: () => void;
  hasInjectedProvider: boolean;
  installedKinds: WalletKind[];
}

const WalletContext = createContext<WalletContextValue | null>(null);

interface InjectedProvider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isOkxWallet?: boolean;
  isRainbow?: boolean;
  providers?: InjectedProvider[];
}

interface Eip6963ProviderDetail {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: InjectedProvider;
}

function providerMatches(kind: WalletKind, detail: Eip6963ProviderDetail): boolean {
  const identity = `${detail.info.rdns} ${detail.info.name}`.toLowerCase();
  if (kind === 'okx') return identity.includes('okx');
  if (kind === 'metamask') return identity.includes('metamask');
  if (kind === 'rainbow') return identity.includes('rainbow');
  if (kind === 'coinbase') return identity.includes('coinbase');
  return false;
}

function getProvider(kind: WalletKind, discovered: Eip6963ProviderDetail[] = []): InjectedProvider | null {
  if (typeof window === 'undefined') return null;

  const announced = discovered.find((detail) => providerMatches(kind, detail));
  if (announced) return announced.provider;

  const injected = (window.ethereum ?? null) as InjectedProvider | null;
  const coinbase = (window.coinbaseWalletExtension ?? null) as InjectedProvider | null;
  if (kind === 'okx') return (window.okxwallet ?? injected?.providers?.find((p) => p.isOkxWallet) ?? null) as InjectedProvider | null;
  if (kind === 'rainbow') return (window.rainbow?.ethereum ?? injected?.providers?.find((p) => p.isRainbow) ?? null) as InjectedProvider | null;

  if (kind === 'coinbase') {
    if (coinbase) return coinbase;
    const fromInjected = injected?.providers?.find((p) => p.isCoinbaseWallet);
    return fromInjected ?? (injected?.isCoinbaseWallet ? injected : null);
  }

  if (kind === 'metamask') {
    const fromInjected = injected?.providers?.find((p) => p.isMetaMask);
    return fromInjected ?? injected ?? null;
  }

  return injected;
}

function detectedWallets(): WalletKind[] {
  if (typeof window === 'undefined') return [];
  const injected = (window.ethereum ?? null) as InjectedProvider | null;
  const providers = injected?.providers ?? (injected ? [injected] : []);
  const found: WalletKind[] = [];
  if (window.okxwallet || providers.some((p) => p.isOkxWallet)) found.push('okx');
  if (providers.some((p) => p.isMetaMask && !p.isOkxWallet) || injected?.isMetaMask) found.push('metamask');
  if (window.phantom?.solana?.isPhantom || window.solana?.isPhantom) found.push('phantom');
  if (window.rainbow?.ethereum || providers.some((p) => p.isRainbow)) found.push('rainbow');
  if (window.coinbaseWalletExtension || providers.some((p) => p.isCoinbaseWallet)) found.push('coinbase');
  return [...new Set(found)];
}

function installedFromAnnouncements(details: Eip6963ProviderDetail[]): WalletKind[] {
  const kinds: WalletKind[] = [];
  for (const kind of ['okx', 'metamask', 'rainbow', 'coinbase'] as WalletKind[]) {
    if (details.some((detail) => providerMatches(kind, detail))) kinds.push(kind);
  }
  return kinds;
}

function validWalletAddress(address: string, kind?: WalletKind): boolean {
  return kind === 'phantom' ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) : isValidAddress(address);
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    kind: null,
    status: 'disconnected',
    network: null,
    error: null,
  });
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false);
  const [installedKinds, setInstalledKinds] = useState<WalletKind[]>([]);
  const announcedProviders = useRef<Eip6963ProviderDetail[]>([]);
  const mounted = useRef(false);

  /* --- restore a previous session (client only, never during SSR) --- */
  useEffect(() => {
    mounted.current = true;
    setHasInjectedProvider(typeof window !== 'undefined' && Boolean(window.ethereum));
    setInstalledKinds(detectedWallets());

    const onProvider = (event: Event) => {
      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail;
      if (!detail?.info?.uuid || !detail.provider?.request) return;
      if (!announcedProviders.current.some((item) => item.info.uuid === detail.info.uuid)) {
        announcedProviders.current = [...announcedProviders.current, detail];
      }
      setInstalledKinds([...new Set([...detectedWallets(), ...installedFromAnnouncements(announcedProviders.current)])]);
    };
    window.addEventListener('eip6963:announceProvider', onProvider);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return () => window.removeEventListener('eip6963:announceProvider', onProvider);
      const parsed = JSON.parse(raw) as { address?: string; kind?: WalletKind; network?: WalletNetwork };
      if (parsed.kind === 'demo') {
        window.localStorage.removeItem(STORAGE_KEY);
        return () => window.removeEventListener('eip6963:announceProvider', onProvider);
      }
      if (parsed.address && parsed.kind && validWalletAddress(parsed.address, parsed.kind)) {
        const restoredNetwork = parsed.kind === 'phantom'
          ? { chainId: 0, name: 'Solana Mainnet', simulated: false }
          : parsed.network && !parsed.network.simulated
            ? parsed.network
            : DEFAULT_NETWORK;
        setState({
          address: parsed.address,
          kind: parsed.kind,
          status: 'connected',
          network: restoredNetwork,
          error: null,
        });
        if (parsed.kind !== 'phantom') {
          const provider = getProvider(parsed.kind, announcedProviders.current);
          void provider?.request({ method: 'eth_chainId' }).then((rawChain) => {
            const chainId = Number.parseInt(String(rawChain), 16);
            if (Number.isFinite(chainId)) {
              setState((prev) => prev.address === parsed.address ? {
                ...prev,
                network: { chainId, name: NETWORK_NAMES[chainId] ?? `Chain ${chainId}`, simulated: false },
              } : prev);
            }
          }).catch(() => undefined);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return () => window.removeEventListener('eip6963:announceProvider', onProvider);
  }, []);

  /* --- persist --- */
  useEffect(() => {
    if (!mounted.current) return;
    if (state.status === 'connected' && state.address) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ address: state.address, kind: state.kind, network: state.network }),
      );
    } else if (state.status === 'disconnected') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.address, state.kind, state.status]);

  /** React to the user switching accounts inside their extension. */
  const handleAccountsChanged = useCallback((accounts: unknown) => {
    const list = Array.isArray(accounts) ? (accounts as string[]) : [];
    if (!list.length) {
      setState({
        address: null,
        kind: null,
        status: 'disconnected',
        network: null,
        error: null,
      });
      return;
    }
    const next = list[0];
    if (isValidAddress(next)) {
      setState((prev) => ({ ...prev, address: next, status: 'connected', error: null }));
    }
  }, []);

  useEffect(() => {
    const provider = getProvider('metamask', announcedProviders.current);
    if (!provider?.on) return;
    provider.on('accountsChanged', handleAccountsChanged);
    return () => {
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, [handleAccountsChanged, hasInjectedProvider]);

  const connect = useCallback(async (kind: WalletKind): Promise<boolean> => {
    setState((prev) => ({ ...prev, status: 'connecting', error: null }));

    /* ---- live adapters ---- */
    if (kind === 'phantom') {
      const provider = window.phantom?.solana ?? window.solana;
      if (!provider?.isPhantom) {
        setState((prev) => ({ ...prev, status: 'error', error: { code: 'wallet_unavailable', message: 'Phantom was not detected in this browser.' } }));
        return false;
      }
      try {
        const result = await provider.connect();
        const solAddress = result.publicKey.toString();
        if (!validWalletAddress(solAddress, 'phantom')) throw new Error('Invalid Solana address');
        setState({ address: solAddress, kind, status: 'connected', network: { chainId: 0, name: 'Solana Mainnet', simulated: false }, error: null });
        return true;
      } catch {
        setState((prev) => ({ ...prev, status: 'error', error: { code: 'connection_rejected', message: 'The Phantom connection request was dismissed.' } }));
        return false;
      }
    }

    if (kind === 'walletconnect') {
      setState((prev) => ({ ...prev, status: 'error', error: {
        code: 'wallet_unavailable',
        message: 'WalletConnect QR requires NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Add a Reown project ID, restart the site, then try again.',
      } }));
      return false;
    }

    window.dispatchEvent(new Event('eip6963:requestProvider'));
    const provider = getProvider(kind, announcedProviders.current);

    if (!provider) {
      const error: ApiError = {
        code: 'wallet_unavailable',
        message:
          `${WALLET_ADAPTERS.find((adapter) => adapter.kind === kind)?.label ?? 'Wallet'} was not detected. Install or enable its browser extension, then refresh this page.`,
      };
      setState((prev) => ({ ...prev, status: 'error', error }));
      return false;
    }

    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];

      if (!Array.isArray(accounts) || accounts.length === 0 || !isValidAddress(accounts[0])) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: {
            code: 'connection_rejected',
            message: 'No authorised account was returned. Approve the connection request and try again.',
          },
        }));
        return false;
      }

      let chainId = SUPPORTED_CHAIN_ID;
      try {
        const rawChain = (await provider.request({ method: 'eth_chainId' })) as string;
        chainId = Number.parseInt(rawChain, 16);
      } catch {
        chainId = SUPPORTED_CHAIN_ID;
      }

      setState({
        address: accounts[0],
        kind,
        status: 'connected',
        network: {
          chainId,
          name: NETWORK_NAMES[chainId] ?? `Chain ${chainId}`,
          simulated: false,
        },
        error: null,
      });
      return true;
    } catch {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: {
          code: 'connection_rejected',
          message: 'The connection request was dismissed. Nothing was shared and no transaction was signed.',
        },
      }));
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (state.kind === 'phantom') void (window.phantom?.solana ?? window.solana)?.disconnect?.();
    setState({ address: null, kind: null, status: 'disconnected', network: null, error: null });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage disabled — nothing to clean up */
    }
  }, [state.kind]);

  const copyAddress = useCallback(async (): Promise<boolean> => {
    if (!state.address) return false;
    try {
      await navigator.clipboard.writeText(state.address);
      return true;
    } catch {
      return false;
    }
  }, [state.address]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, status: prev.address ? 'connected' : 'disconnected' }));
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({ ...state, connect, disconnect, copyAddress, clearError, hasInjectedProvider, installedKinds }),
    [state, connect, disconnect, copyAddress, clearError, hasInjectedProvider, installedKinds],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used inside <WalletProvider>');
  }
  return ctx;
}
