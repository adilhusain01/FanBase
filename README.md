# FanBase

FanBase is a verifiable football-ticket allocation prototype for the Injective Global Cup. It makes fan enthusiasm a capped, auditable lottery boost—not a hidden ranking—and issues non-transferable, identity-bound entry passes to limit resale.

## Components

- `web/` — Next.js applicant experience, live World Cup data, x402 payment gate, public-evidence scoring, and a reproducible draw verifier.
- `contracts/` — Foundry project containing the non-transferable `FanBasePass` ERC-721 for Injective EVM testnet.
- `mcp/` — read-only Model Context Protocol server for policy, score-commitment, anti-scalping, and live-fixture queries.
- `plan/README.md` — product rationale, threat model, and delivery plan.

## Run locally

```bash
git submodule update --init --recursive

cd web && pnpm install && pnpm dev
cd ../contracts && forge test
cd ../mcp && pnpm install && pnpm dev
```

Copy `web/.env.example` to `web/.env.local` and set real provider credentials before enabling payments or public-post evidence. FanBase intentionally does not fabricate fixture data, X posts, AI scores, or payment receipts when those integrations are unavailable.

## Testnet targets

- Injective EVM testnet: chain ID `1439`
- Circle CCTP testnet domain: `29`
- Passes are issued only after allocation and cannot be transferred or approved for resale.
