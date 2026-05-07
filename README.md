# SkyeGate Next.js Starter

A minimal Next.js 15 App Router app demonstrating [`@skyemeta/skyegate`](https://www.npmjs.com/package/@skyemeta/skyegate) — wallet-verified gated content with server-side JWT validation. Connect a wallet, meet a condition, see the unlock. Powered by [InsumerAPI](https://insumermodel.com/developers/).

```
wagmi + RainbowKit  →  <GatedContent />  →  /api/gated-content (server)
                          ↓                       ↓
                  POST /api/verify           validateContentToken(jwt)
                          ↓                       ↓
              skyemeta.com proxy → InsumerAPI returns signed JWT
```

## What it shows

- Wallet connect via RainbowKit (any of the wallets RainbowKit supports — MetaMask, Coinbase Wallet, Rabby, WalletConnect, etc.)
- Condition-based gating with `<GatedContent />` from `@skyemeta/skyegate/react`
- Server-side JWT validation in a Next.js route handler with `validateContentToken`
- Replay protection — the same `expectedConditions` are checked client-side by the proxy and again server-side before content delivery

## Run it

```bash
git clone https://github.com/douglasborthwick-crypto/skyegate-nextjs-starter
cd skyegate-nextjs-starter
npm install
cp .env.local.example .env.local      # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), connect a wallet, watch the gate.

## You need

1. **A SkyeGate Pro license key** (`SKYE-XXXX-XXXX-XXXX`). Buy direct:
   - **[Annual — $350/yr](https://buy.stripe.com/8x26oA9F6eWAeAC7S804805)** (save 40%)
   - [Monthly — $49/mo](https://buy.stripe.com/eVqbIU18A6q43VY7S804800)

   Same key works on the WordPress plugin and this SDK — one license, two stacks. Comparison and FAQ at [skyemeta.com/skyegate](https://skyemeta.com/skyegate/).
2. **A WalletConnect Project ID** for RainbowKit. Free at [cloud.walletconnect.com](https://cloud.walletconnect.com/).

Set both in `.env.local`:

```sh
NEXT_PUBLIC_SKYE_LICENSE_KEY=SKYE-XXXX-XXXX-XXXX
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
```

## Customize the gate

`app/page.tsx` defines a single condition (the default: ≥ 0.000001 ETH on Ethereum mainnet). Swap it for any of the 4 supported types:

```tsx
// Token balance — any ERC-20 / SPL / native token
{ type: 'token_balance', contractAddress: 'native', chainId: 1, threshold: 0.01 }

// NFT ownership — any ERC-721 / ERC-1155 / Solana NFT
{ type: 'nft_ownership', contractAddress: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85', chainId: 1 }   // ENS

// EAS attestation — Coinbase Verified, Gitcoin Passport, etc.
{ type: 'eas_attestation', template: 'coinbase_verified_account' }

// Farcaster identity — wallet linked to a Farcaster account
{ type: 'farcaster_id' }
```

Then update the **same** condition in `app/api/gated-content/route.ts` so the server-side replay-protection check matches. (If they don't match, the route returns 403 even on a valid JWT.)

You can stack up to 10 conditions per gate; `pass=true` requires every one to be met.

## Domain locking

Your SkyeGate Pro license auto-binds to its first production domain on first use. After that, only that domain (and its subdomains — `staging.foo.com` works under a `foo.com` bind) can use the key. `localhost`, `*.vercel.app` preview URLs, and `*.local` skip the bind so dev and preview deploys don't burn it.

To move a key to a different domain, contact support.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdouglasborthwick-crypto%2Fskyegate-nextjs-starter)

After clicking, set `NEXT_PUBLIC_SKYE_LICENSE_KEY` and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in the Vercel project's environment variables. The first request from your custom production domain auto-binds the license.

## How it works in 60 seconds

1. The browser collects a wallet address from wagmi + RainbowKit.
2. `<GatedContent />` calls `verifyConditions(address, conditions, licenseKey)` which POSTs to the SkyeMeta proxy at `skyemeta.com/api/verify`.
3. The proxy validates your license + domain and forwards the request to InsumerAPI. InsumerAPI returns a signed JWT.
4. On `pass: true`, `<GatedContent>` renders its `children` and fires `onPass(jwt)`.
5. Your `onPass` handler POSTs the JWT to `/api/gated-content`. The route handler calls `validateContentToken(jwt, { expectedConditions })` — `jose` verifies the ECDSA P-256 signature against InsumerAPI's JWKS, checks `exp`, and confirms the signed conditions match what the route requires.
6. Only on a clean `pass` does the route return the gated content. The text never reaches the browser otherwise — not even in the page source or the JS bundle.

## License

MIT — fork it, ship it, customize it. The SDK (`@skyemeta/skyegate`) is also MIT.
