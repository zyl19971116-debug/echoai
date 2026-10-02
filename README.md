# ECHO AI

## Live on-chain data

The app runs in deterministic demo mode by default. Keep this explicit setting while designing or presenting the product:

```bash
DATA_MODE=demo
```

When you are ready to analyse real EVM wallets, set `DATA_MODE=live` and add a server-only Alchemy key:

```bash
DATA_MODE=live
ALCHEMY_API_KEY=your_key_here
```

Restart the development server after changing the environment file. In demo mode the key is ignored, even if one is present. The key is used only by Next.js route handlers and must never be prefixed with `NEXT_PUBLIC_`.

The first live-data release supports Ethereum mainnet profiles. The data layer also has network mappings ready for Base, Arbitrum and Optimism; wallet connection currently validates Ethereum mainnet before analysis. My Echo, Timeline and Battle call the server APIs. Timeline and battle curves remain clearly labelled simulations derived from the real wallet profile; no trades are executed.

### Paginated multi-chain activity

`/my-echo` includes a read-only transaction explorer backed by `GET /api/transactions/[address]`. It returns 20 records at a time and an opaque `nextCursor`; the browser never receives the provider API key. Supported tabs are Ethereum, BNB Chain, Base, Arbitrum, Robinhood Chain (mainnet chain ID 4663), Polygon, Optimism and Solana. EVM tabs reuse the connected `0x` address. Solana uses a separate address field because its address format and wallet ecosystem differ from EVM wallets. In `DATA_MODE=demo`, the same API contract returns deterministic paginated examples.

**What if your wallet had another life?**

ECHO AI reads a wallet's public on-chain history, builds a behavioural model of it, and generates an
AI counterpart — an **AI Shadow** — that starts from the same position but makes *different decisions*.
The user then compares **HUMAN vs AI SHADOW** across a timeline, a global leaderboard and head-to-head battles.

> **This build is a simulation and analytics product.**
> It does not execute trades, does not hold custody, does not request seed phrases or private keys,
> does not move assets, and has no token. Every number you see is either public wallet data or
> deterministic mock data, and every projection is labelled as simulated.

---

## 1. Overview

The product is built around one emotional idea: *"I am meeting another version of myself."*
The AI Shadow is the main character; wallet statistics are supporting evidence.

Five routes carry the experience:

| Route       | Purpose                                                                     |
| ----------- | --------------------------------------------------------------------------- |
| `/`         | Cinematic hero, live ECHO WORLD panel, four feature cards, archetype gallery |
| `/my-echo`  | The AI Shadow: portrait, decision model, on-chain personality, profile stats |
| `/timeline` | Two portfolio curves from one starting balance + the decision log            |
| `/world`    | Global humans-vs-AI aggregates and the 20-row shadow leaderboard             |
| `/battle`   | Any wallet vs any wallet — Shadow vs Shadow simulation + share card          |

Mock API endpoints are already in place for the future backend:

```
GET  /api/wallet/[address]          → WalletProfile + shadow preview
GET  /api/shadow/[address]?days=30  → AIShadowProfile + series + decision log
GET  /api/world                     → aggregates + leaderboard
GET|POST /api/battle                → { one, two, days } → BattleResult
```

---

## 2. Tech stack

| Layer      | Choice                                        |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 14 (App Router) + React 18            |
| Language   | TypeScript (strict)                           |
| Styling    | Tailwind CSS 3                                |
| Motion     | Framer Motion                                 |
| Charts     | Recharts                                      |
| Icons      | Lucide                                        |
| Fonts      | System stack (no external font fetch at build) |

No wallet SDK is installed and no API key is required — the project runs fully offline.

---

## 3. Installation

```bash
cd echo-ai
npm install
```

Requirements: Node.js 18.17+ (developed on Node 22), npm 9+.

## 4. Development

```bash
npm run dev
# → http://localhost:3000
```

## 5. Build

```bash
npm run build     # production build (type-checks as part of the build)
npm run start     # serve the production build
npm run typecheck # tsc --noEmit
```

## 6. Folder structure

```
echo-ai/
├─ app/
│  ├─ layout.tsx              # root shell: providers, header, footer, backdrop
│  ├─ page.tsx                # HOME
│  ├─ my-echo/page.tsx        # MY ECHO
│  ├─ timeline/page.tsx       # TIMELINE
│  ├─ world/page.tsx          # WORLD
│  ├─ battle/page.tsx         # BATTLE (accepts ?one=&two=)
│  ├─ error.tsx / not-found.tsx
│  ├─ globals.css             # design tokens, glass/grid/glow primitives
│  ├─ providers.tsx           # Toast → Wallet → ConnectFlow
│  └─ api/                    # mock API layer (swap-in point for real data)
│     ├─ wallet/[address]/route.ts
│     ├─ shadow/[address]/route.ts
│     ├─ world/route.ts
│     └─ battle/route.ts
├─ components/
│  ├─ layout/                 # Header, Footer, PageShell
│  ├─ ui/                     # EchoLogo, GlowButton, Panel, Badge, Modal, Toast,
│  │                          # AnimatedNumber, AvatarStack, DataStat, ParticleField…
│  ├─ home/                   # Hero, HeroVisual, EchoWorldPanel, FeatureCards
│  ├─ shadow/                 # FigurePanel, AttributeBar, ShadowLoader
│  ├─ echo/MyEchoView.tsx
│  ├─ timeline/TimelineView.tsx
│  ├─ world/WorldView.tsx
│  ├─ battle/BattleView.tsx
│  ├─ share/ShareCard.tsx     # canvas PNG export (1080×1350)
│  └─ charts/                 # WorldComparisonChart, PortfolioChart, ShadowRadar, BattleChart
├─ hooks/
│  ├─ useWallet.tsx           # connection state + persistence + adapter layer
│  ├─ useConnectFlow.ts       # shared "connect → build shadow → /my-echo" journey
│  ├─ useCountUp.ts           # rAF counter, in-view trigger, scroll flag
│  └─ useParallax.ts          # pointer parallax (spring-smoothed)
├─ lib/
│  ├─ walletAnalysis.ts       # address → WalletProfile (deterministic)
│  ├─ shadowEngine.ts         # WalletProfile → AIShadowProfile, curves, battles, events
│  ├─ archetypes.ts           # 7 behavioural archetypes + resolution rules
│  ├─ seed.ts                 # FNV-1a hash, mulberry32 PRNG, fixed reference date
│  ├─ api.ts                  # response envelope helpers
│  └─ format.ts               # currency / date / className helpers
├─ data/demo.ts               # 20 demo wallets, world stats, leaderboard, showcase battle
├─ types/index.ts             # domain contract shared by UI, API and engine
└─ public/assets/echo/        # character imagery (replaceable — see §10)
```

---

## 7. Demo mode

Every feature works without a wallet extension, network access or API key.

- The header **CONNECT WALLET** button opens an adapter picker.
- **DEMO WALLET** connects instantly to a read-only sample address:
  `0x71F88e872356102f740fed1946e7ac4730a2A92C`
- Connecting runs the Shadow sequence — `SCANNING WALLET → READING HISTORY → MAPPING BEHAVIOR →
  CREATING SHADOW → YOUR ECHO IS READY` — then routes to `/my-echo`.
- With no wallet connected, `/my-echo` and `/timeline` fall back to the demo wallet so the site is
  never empty.
- Addresses beginning with `0x0000` are treated as **empty wallets**, so the empty-state UI is
  reachable without editing code.

### The deterministic data engine

`lib/walletAnalysis.ts` and `lib/shadowEngine.ts` contain no randomness:

1. The address is hashed with FNV-1a (`lib/seed.ts`).
2. That hash seeds a `mulberry32` PRNG.
3. All metrics, the archetype, the Shadow attributes, every portfolio curve and every battle result
   are derived from that stream.

Archetypes are resolved by **nearest-centroid classification** (`lib/archetypes.ts`), not by a decision
cascade: the profile is compared against each archetype's ideal behaviour profile and takes the closest
one. A cascade needs an arbitrary `else` branch, which silently piles every unmatched wallet into a
single archetype; distance-based resolution needs no fallback and produces a balanced spread across the
demo world (7/7 archetypes among human wallets, 6/7 among Shadows — Guardian Shadows are inherently
rare because the engine gives every Shadow a timing boost, and a counterpart that does nothing is not
an interesting experiment).

Consequences:

- The same wallet always produces the same profile and the same Shadow.
- Server-rendered markup matches the client's first render (no hydration mismatches).
- A single fixed reference date (`REFERENCE_DATE` in `lib/seed.ts`) is used instead of `Date.now()`,
  so the demo dataset never drifts between sessions.
- Changing the *order* of PRNG calls changes the whole demo world — treat it as a schema.

The demo wallet address was chosen by searching for an address (with the documented `0x71F8…A92C`
prefix/suffix) whose derived profile lands on the showcase archetype: **THE HUNTER**, risk 81,
activity 88, holding 41, 12,452 transactions across 1,014 active days.

---

## 8. Wallet architecture

`hooks/useWallet.tsx` implements a small adapter layer over EIP-1193 — no SDK dependency:

```ts
connect('metamask' | 'coinbase' | 'walletconnect' | 'demo')
```

- **MetaMask / Coinbase** use the injected provider (`window.ethereum`, `window.coinbaseWalletExtension`,
  including multi-provider `providers[]`).
- **WalletConnect** is declared but intentionally not wired (it requires a project ID). Selecting it
  explains the situation and suggests demo mode instead of failing silently.
- If no provider exists, the UI shows *"not detected"* and the error is surfaced in the modal with a
  recovery path.
- `eth_requestAccounts` is the **only** method ever called, plus `eth_chainId` for the network label.
  No signature, no transaction, no `eth_sendTransaction`.
- Unsupported networks and rejected connections produce typed errors (`unsupported_network`,
  `connection_rejected`, `wallet_unavailable`) that render as plain language, never as raw errors.
- The session is persisted in `localStorage` under `echo-ai:wallet:v1`; disconnecting clears it.
- `accountsChanged` is handled so switching accounts in the extension re-analyses the wallet.

Swapping in wagmi/RainbowKit means implementing the same interface in one file — the UI does not change.

---

## 9. Future integration points

### Blockchain data

Replace the body of `analyzeWallet` (`lib/walletAnalysis.ts`) with an indexer call, or point the UI at
`/api/wallet/[address]` and delete the local computation. The response contract already matches:

```ts
WalletProfile {
  address, walletAge, transactions, activeDays, protocols, nftCount,
  riskScore, activityScore, diversityScore, holdingScore, tradingFrequency,
  archetype, firstSeen, lastActive, isEmpty?
}
```

Suggested providers: an RPC endpoint for balances/timestamps, plus an indexer (e.g. an explorer API or
a subgraph) for transactions, protocols and NFT counts. Keep the derived scores in
`resolveArchetype` so behaviour stays explainable.

### AI behaviour model

`generateShadow` (`lib/shadowEngine.ts`) currently derives the Shadow's decision model
deterministically. To move to a hosted AI model:

1. Keep returning the `AIShadowProfile` shape (`attributes`, `archetype`, `summary`, `personality`).
2. Feed the model the `WalletProfile` plus the decision log template.
3. Cache by address — the Shadow should never change between page loads for the same wallet.

The `personality` paragraph is already generated from profile values via banded templates, so the copy
can never contradict the numbers; an LLM prompt should preserve that constraint.

---

## 10. Asset replacement

The hero and My Echo portraits are drawn SVG placeholders in `public/assets/echo/`:

| File            | Used by                          | Target replacement             |
| --------------- | -------------------------------- | ------------------------------ |
| `human.svg`     | hero left panel                  | `human.png` — human portrait    |
| `ai-shadow.svg` | hero right panel, My Echo        | `ai-shadow.png` — AI character  |

To drop in real imagery: add `human.png` / `ai-shadow.png` to `public/assets/echo/` and update the two
`src` props in `components/home/HeroVisual.tsx` and `components/echo/MyEchoView.tsx`.

Recommended spec: portrait orientation, **3:4** (e.g. 900×1200), subject centred in the upper two
thirds, dark background around `#050914` so it blends into the page. `FigurePanel` already handles the
floor glow, containment rings, scanline, corner brackets and the `YOU / AI YOU` identity plates — and
falls back to a drawn silhouette if an image is missing or fails to load.

---

## 11. Safety and trust UI

Wallet connection is explicitly framed as read-only:

- *"ECHO AI reads public on-chain data only."*
- *"We never request your seed phrase or private key."*
- *"Connecting a wallet never gives us custody of your assets."*
- *"No signature required · No transaction · Read-only."*
- Every simulated surface carries a `SIMULATION` badge; the footer states the same in full.
- The share card embeds "SIMULATED · NOT FINANCIAL ADVICE" directly in the exported PNG.

---

## 12. Notes

- **No project token.** No tokenomics. Nothing on this site is an offer of financial return.
- Charts animate on view; all animations are disabled under `prefers-reduced-motion`.
- Desktop is the primary breakpoint (1920/1440/1280), with 2-column tablet and 1-column mobile
  layouts for the card grids, and a stacked hero (copy first, visual second) on mobile.
- Canvas share export is done client-side; if a browser blocks it, the DOM preview remains shareable.
